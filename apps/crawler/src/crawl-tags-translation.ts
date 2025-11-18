import Cloudflare from 'cloudflare'

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
      .flatMap(item =>
        Object.entries(item.data).map(([key, obj]) => ({
          key,
          value: obj.name,
        })),
      )

    console.log('Extracted key-value pairs count:', keyValuePairs.length)
    console.log('Sample pairs:', keyValuePairs.slice(0, 5))

    // 检查是否有相同的 key 但不同的 value
    // 20251117 检查结果: 489/38379 冲突
    // 暂时不解决这个问题了，不同命名空间有冲突内容，就直接把冲突的全删掉，不然当前的记录 tags 的系统要大改
    // 目前只有 female 这个命名空间下有 f: 的前缀，别的都没有，如果把所有 tags 加上前缀可能会很乱
    // 举例：sango 语言和 sango 艺术家
    // 参号是谁翻译成 sango 的，任何地方都是参号作为 native 名称，只有 twitter 的用户名是 @sango3_3
    // 那用 sango3_3 不就不会冲突了吗？？？
    const keyMap = new Map<string, string[]>()
    for (const pair of keyValuePairs) {
      if (!keyMap.has(pair.key)) {
        keyMap.set(pair.key, [])
      }
      keyMap.get(pair.key)!.push(pair.value)
    }

    const duplicateKeys = Array.from(keyMap.entries())
      .filter(([_key, values]) => new Set(values).size > 1)
      .map(([key, values]) => ({ key, values: Array.from(new Set(values)) }))

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
 * 使用 Cloudflare SDK 的 bulk update 接口
 * API 文档: https://developers.cloudflare.com/api/node/resources/kv/subresources/namespaces/methods/bulk_update/
 */
export async function saveToCloudflareKV(
  env: Env,
  keyValuePairs: Array<{ key: string, value: string }>,
): Promise<void> {
  const apiToken = env.CLOUDFLARE_API_TOKEN
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const namespaceId = env.KV_NAMESPACE_ID

  if (!apiToken || !accountId || !namespaceId) {
    const error = 'Missing required environment variables: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, or KV_NAMESPACE_ID'
    console.error(error)
    throw new Error(error)
  }

  console.log(`Preparing to save ${keyValuePairs.length} key-value pairs to KV...`)

  // 创建 Cloudflare 客户端
  const client = new Cloudflare({
    apiToken,
  })

  // Cloudflare KV bulk update API 每次最多支持 10000 个键值对
  const BATCH_SIZE = 10000
  const totalBatches = Math.ceil(keyValuePairs.length / BATCH_SIZE)

  console.log(`Will process ${totalBatches} batches`)

  try {
    for (let i = 0; i < keyValuePairs.length; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1
      const batch = keyValuePairs.slice(i, i + BATCH_SIZE)

      console.log(`Processing batch ${batchIndex}/${totalBatches} with ${batch.length} items...`)

      const response = await client.kv.namespaces.bulkUpdate(namespaceId, {
        account_id: accountId,
        body: batch,
      })

      if (response) {
        console.log(`Batch ${batchIndex}/${totalBatches} saved successfully. Successful keys: ${response.successful_key_count}`)
      }
      else {
        console.log(`Batch ${batchIndex}/${totalBatches} completed (no response data)`)
      }
    }

    console.log(`All ${keyValuePairs.length} key-value pairs saved to KV successfully`)
  }
  catch (error) {
    console.error('Error in saveToCloudflareKV:', error)
    throw error
  }
}
