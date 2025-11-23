import { Cloudflare } from 'cloudflare'

import { NAMESPACE_ABBREVIATIONS } from './utils'

export const CRAWL_TAGS_TRANSLATION_MESSAGE = 'crawl-tags-translation'

/**
 * 处理 tags 中文翻译的爬取任务
 * 从 GitHub 仓库 EhTagTranslation/Database 的最新 release 获取 db.text.json
 * 并将数据保存到 Cloudflare KV
 */
export async function handleTagsTranslationCrawling(env: Env): Promise<void> {
  const keyValuePairs = await fetchTagsTranslationDb(env)
  await saveToCloudflareKV(env, keyValuePairs)
}

/**
 * 获取标签翻译数据库
 * @returns 返回 key-value pairs 数组，每个对象包含 key 和 value 字段
 */
export async function fetchTagsTranslationDb(env: Env): Promise<Array<{ key: string, value: string }>> {
  console.log('Tags translation crawling task started.')

  const githubPat = env.GITHUB_PAT
  if (!githubPat) {
    const error = 'GITHUB_PAT environment variable is not set'
    console.error(error)
    throw new Error(error)
  }

  try {
    // 获取最新的 release 信息
    const releaseResponse = await fetch(
      'https://api.github.com/repos/EhTagTranslation/Database/releases/latest',
      {
        headers: {
          'Authorization': `Bearer ${githubPat}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ehentai-toplist-archive-crawler',
        },
      },
    )

    if (!releaseResponse.ok) {
      const errorText = await releaseResponse.text()
      console.error('Failed to fetch latest release:', errorText)
      throw new Error(`Failed to fetch latest release: ${errorText}`)
    }

    const releaseData = await releaseResponse.json() as {
      assets: Array<{ name: string, browser_download_url: string }>
    }

    // 查找 db.text.json 文件
    const dbTextAsset = releaseData.assets.find(asset => asset.name === 'db.text.json')
    if (!dbTextAsset) {
      const error = 'db.text.json not found in latest release assets'
      console.error(error)
      throw new Error(error)
    }

    console.log('Found db.text.json at:', dbTextAsset.browser_download_url)

    // 下载 db.text.json 文件
    const tagDbResponse = await fetch(dbTextAsset.browser_download_url, {
      headers: {
        'Authorization': `Bearer ${githubPat}`,
        'Accept': 'application/json',
        'User-Agent': 'ehentai-toplist-archive-crawler',
      },
    })

    if (!tagDbResponse.ok) {
      const errorText = await tagDbResponse.text()
      console.error('Failed to download db.text.json:', errorText)
      throw new Error(`Failed to download db.text.json: ${errorText}`)
    }

    const tagDb = await tagDbResponse.json() as {
      data: Array<{
        namespace: string
        data: Record<string, { name: string }>
      }>
    }
    console.log('Successfully downloaded db.text.json')

    // 提取所有 key-value pairs (使用 flatMap 优化性能)
    // 排除 namespace 为 'rows' 的对象
    const keyValuePairs = tagDb.data
      .filter(item => item.namespace !== 'rows')
      .flatMap((item) => {
        const namespace = item.namespace
        const prefix = NAMESPACE_ABBREVIATIONS[namespace] ?? namespace

        return Object.entries(item.data).map(([key, obj]) => ({
          key: `${prefix}:${key}`,
          value: obj.name,
        }))
      })

    console.log('Extracted key-value pairs count:', keyValuePairs.length)
    console.log('Sample pairs:', keyValuePairs.slice(0, 5))

    // 检查是否有相同的 key 但不同的 value

    // 优化：使用 reduce 构建 Map，避免重复查询
    const keyMap = keyValuePairs.reduce((map, pair) => {
      const existing = map.get(pair.key)
      if (existing) {
        existing.push(pair.value)
      }
      else {
        map.set(pair.key, [pair.value])
      }
      return map
    }, new Map<string, string[]>())

    // 优化：filter 和 map 中复用 Set，避免重复创建
    const duplicateKeys = Array.from(keyMap.entries())
      .map(([key, values]) => {
        const uniqueValues = new Set(values)
        return { key, values, uniqueValuesSet: uniqueValues }
      })
      .filter(item => item.uniqueValuesSet.size > 1)
      .map(item => ({ key: item.key, values: Array.from(item.uniqueValuesSet) }))

    if (duplicateKeys.length > 0) {
      console.log('⚠️ Found duplicate keys with different values:', duplicateKeys.length)
      console.log('Examples:', duplicateKeys.slice(0, 10))

      // 创建冲突 key 的 Set 用于快速查找
      const conflictingKeys = new Set(duplicateKeys.map(item => item.key))

      // 过滤掉所有冲突的 key
      const filteredPairs = keyValuePairs.filter(pair => !conflictingKeys.has(pair.key))

      console.log(`Removed ${keyValuePairs.length - filteredPairs.length} conflicting entries`)
      console.log(`Final key-value pairs count: ${filteredPairs.length}`)

      return filteredPairs
    }
    else {
      console.log('✓ No duplicate keys with different values found')
      return keyValuePairs
    }
  }
  catch (error) {
    console.error('Error in fetchTagsTranslationDb:', error)
    throw error
  }
}

/**
 * 将 key-value pairs 批量写入 Cloudflare KV
 * 优化策略：先批量读取现有值，对比差异后只写入变更的键值对
 *
 * 使用 KV binding 的批量读取 API：
 * - 每次最多读取 100 个键
 * - 返回 Map<string, string | null>
 *
 * 使用 Cloudflare SDK 的 bulk update 接口写入变更
 */
export async function saveToCloudflareKV(
  env: Env,
  keyValuePairs: Array<{ key: string, value: string }>,
): Promise<void> {
  // 检查环境变量
  if (!env.KV) {
    throw new Error('KV binding is not available in env')
  }

  const apiToken = env.CLOUDFLARE_API_TOKEN
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const namespaceId = env.KV_NAMESPACE_ID

  if (!apiToken || !accountId || !namespaceId) {
    const error = 'Missing required environment variables: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, or KV_NAMESPACE_ID'
    console.error(error)
    throw new Error(error)
  }

  console.log(`Preparing to process ${keyValuePairs.length} key-value pairs...`)

  // 步骤 1: 批量读取现有的 KV 数据
  console.log('Step 1: Reading existing KV values...')
  const existingValues = await batchReadKV(env.KV, keyValuePairs.map(p => p.key))
  console.log(`Read ${existingValues.size} existing values from KV`)

  // 步骤 2: 对比差异，找出需要写入的键值对
  console.log('Step 2: Comparing differences...')

  // 使用 filter 一次性过滤出需要写入的数据
  const pairsToWrite = keyValuePairs.filter((pair) => {
    const existingValue = existingValues.get(pair.key)
    // 如果 KV 中不存在该键，或者值不同，则需要写入
    return existingValue === undefined || existingValue !== pair.value
  })

  const unchangedCount = keyValuePairs.length - pairsToWrite.length
  console.log(`Found ${pairsToWrite.length} pairs to update (${unchangedCount} unchanged)`)

  // 如果没有需要写入的数据，直接返回
  if (pairsToWrite.length === 0) {
    console.log('No changes detected, skipping KV write')
    return
  }

  // 步骤 3: 批量写入变更的数据
  console.log(`Step 3: Writing ${pairsToWrite.length} changed pairs to KV...`)
  await batchWriteKV(apiToken, accountId, namespaceId, pairsToWrite)

  console.log(`Successfully updated ${pairsToWrite.length} key-value pairs in KV`)
}

/**
 * 批量读取 KV 中的值
 * 使用 KV binding 的批量 get API，每次最多读取 100 个键
 *
 * @param kv KV namespace binding
 * @param keys 要读取的键数组
 * @returns Map<key, value>，如果键不存在则不包含在 Map 中
 */
async function batchReadKV(
  kv: KVNamespace,
  keys: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>()

  // KV 批量读取每次最多 100 个键
  const BATCH_SIZE = 100
  const totalBatches = Math.ceil(keys.length / BATCH_SIZE)

  console.log(`Reading ${keys.length} keys in ${totalBatches} batches...`)

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1
    const batchKeys = keys.slice(i, i + BATCH_SIZE)

    try {
      // 使用 KV binding 的批量 get 方法
      const batchResult = await kv.get(batchKeys, 'text')

      // 将结果合并到 result Map 中
      for (const [key, value] of batchResult.entries()) {
        if (value !== null) {
          result.set(key, value)
        }
      }

      console.log(`Read batch ${batchIndex}/${totalBatches}: ${batchResult.size} values`)
    }
    catch (error) {
      console.error(`Error reading batch ${batchIndex}:`, error)
      throw error
    }
  }

  return result
}

/**
 * 批量写入 KV
 * 使用 Cloudflare SDK 的 bulk update 接口
 *
 * @param apiToken Cloudflare API token
 * @param accountId Cloudflare account ID
 * @param namespaceId KV namespace ID
 * @param pairs 要写入的键值对数组
 */
async function batchWriteKV(
  apiToken: string,
  accountId: string,
  namespaceId: string,
  pairs: Array<{ key: string, value: string }>,
): Promise<void> {
  // 创建 Cloudflare 客户端
  const client = new Cloudflare({
    apiToken,
  })

  // Cloudflare KV bulk update API 每次最多支持 10000 个键值对
  const BATCH_SIZE = 10000
  const totalBatches = Math.ceil(pairs.length / BATCH_SIZE)

  console.log(`Writing ${pairs.length} pairs in ${totalBatches} batches...`)

  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1
    const batch = pairs.slice(i, i + BATCH_SIZE)

    try {
      const response = await client.kv.namespaces.bulkUpdate(namespaceId, {
        account_id: accountId,
        body: batch,
      })

      if (response) {
        console.log(`Write batch ${batchIndex}/${totalBatches}: ${response.successful_key_count} keys updated`)
      }
      else {
        console.log(`Write batch ${batchIndex}/${totalBatches}: completed (no response data)`)
      }
    }
    catch (error) {
      console.error(`Error writing batch ${batchIndex}:`, error)
      throw error
    }
  }
}
