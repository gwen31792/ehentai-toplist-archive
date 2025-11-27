import { galleriesTable } from '@ehentai-toplist-archive/db'
import * as cheerio from 'cheerio'
import { asc, count, eq, isNull, lt, or } from 'drizzle-orm'

import { TemporaryBanError } from './types'
import { cfFetch, delay, getDbClient, NAMESPACE_ABBREVIATIONS } from './utils'

export const UPDATE_GALLERY_TAGS_MESSAGE = 'update-gallery-tags'

export async function handleUpdateGalleryTags(env: Env): Promise<void> {
  console.log('Update gallery tags task started.')
  const db = getDbClient(env)

  // 计算一个月前的日期
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const thresholdDate = oneMonthAgo.toISOString().split('T')[0]

  const totalResult = await db
    .select({ count: count() })
    .from(galleriesTable)
    .where(
      or(
        isNull(galleriesTable.updated_at),
        lt(galleriesTable.updated_at, thresholdDate),
      ),
    )
    .get()

  console.log(`Total galleries needing update: ${totalResult?.count ?? 0}`)

  // 查询 updated_at 为空 或者 updated_at 早于一个月前的 gallery，限制 5 条
  // SQLite 中 NULL 比任何值都小，所以 ASC 排序时 NULL 会排在最前面
  const galleries = await db
    .select()
    .from(galleriesTable)
    .where(
      or(
        isNull(galleriesTable.updated_at),
        lt(galleriesTable.updated_at, thresholdDate),
      ),
    )
    .orderBy(asc(galleriesTable.updated_at))
    .limit(100)
    .all()

  if (galleries.length === 0) {
    console.log('No galleries found needing update.')
    return
  }

  console.log(`Found ${galleries.length} galleries to update.`)

  for (const gallery of galleries) {
    console.log(`Processing gallery: ${gallery.gallery_id} - ${gallery.gallery_url}`)

    try {
      const response = await cfFetch(env, gallery.gallery_url)

      if (!response.ok) {
        console.error(`Failed to fetch gallery page: ${response.status} ${response.statusText}`)

        // 如果画廊不存在 (404) 或已删除 (410)，更新 updated_at 以避免重复重试
        if (response.status === 404 || response.status === 410) {
          console.warn(`Gallery ${gallery.gallery_id} is gone. Updating timestamp to skip future checks.`)
          // 使用当前时间更新，避免死循环
          await db
            .update(galleriesTable)
            .set({ updated_at: new Date().toISOString().split('T')[0] })
            .where(eq(galleriesTable.gallery_id, gallery.gallery_id))
        }

        continue
      }

      const html = await response.text()
      console.log(`Fetched page content, length: ${html.length}`)

      if (html.includes('This IP address has been temporarily banned')) {
        console.error('Temporary ban detected. Stopping update-gallery-tags task.')
        throw new TemporaryBanError('Temporary IP ban encountered while updating gallery tags.', {
          gallery_id: gallery.gallery_id,
          gallery_url: gallery.gallery_url,
        })
      }

      const tags = parseGalleryTags(html)

      console.log(`Parsed tags for gallery ${gallery.gallery_id}:`, tags)

      // 从 KV 中批量读取标签翻译
      const tagsZh = await translateTags(env.KV, tags)
      console.log(`Translated tags for gallery ${gallery.gallery_id}:`, tagsZh)

      const tagsString = tags.join(', ')
      const tagsZhString = tagsZh.join(', ')
      const now = new Date().toISOString().split('T')[0]

      await db
        .update(galleriesTable)
        .set({
          tags: tagsString,
          tags_zh: tagsZhString,
          updated_at: now,
        })
        .where(eq(galleriesTable.gallery_id, gallery.gallery_id))

      // 避免请求过快，等待 5 秒
      await delay(5000)
    }
    catch (error) {
      if (error instanceof TemporaryBanError) {
        console.warn('Update gallery tags task terminated early due to temporary IP ban.', error.context)
        return
      }
      console.error(`Error processing gallery ${gallery.gallery_id}:`, error)
    }
  }
}

function parseGalleryTags(html: string): string[] {
  const $ = cheerio.load(html)
  const tags: string[] = []

  $('#taglist table tbody tr').each((_, tr) => {
    const namespaceText = $(tr).find('td.tc').text().trim().replace(':', '')
    const namespace = NAMESPACE_ABBREVIATIONS[namespaceText] ?? namespaceText

    $(tr).find('td').not('.tc').find('div.gt').each((_, div) => {
      const tag = $(div).find('a').text().trim()
      if (tag) {
        tags.push(`${namespace}:${tag}`)
      }
    })
  })

  return tags
}

/**
 * 从 KV 中批量读取标签翻译
 * @param kv KV namespace binding
 * @param tags 原始标签数组（格式：prefix:tag）
 * @returns 翻译后的标签数组，未找到翻译的标签保留原值
 */
async function translateTags(kv: KVNamespace, tags: string[]): Promise<string[]> {
  if (tags.length === 0) {
    return []
  }

  // 批量读取翻译（每次最多 100 个）
  const BATCH_SIZE = 100
  const translationMap = new Map<string, string>()

  for (let i = 0; i < tags.length; i += BATCH_SIZE) {
    const batchKeys = tags.slice(i, i + BATCH_SIZE)
    const batchResult = await kv.get(batchKeys, 'text')

    for (const [key, value] of batchResult.entries()) {
      if (value !== null) {
        translationMap.set(key, value)
      }
    }
  }

  // 构建翻译后的标签数组
  return tags.map((tag) => {
    const translation = translationMap.get(tag)
    if (translation) {
      // 提取 namespace 前缀
      const colonIndex = tag.indexOf(':')
      const namespace = colonIndex > -1 ? tag.substring(0, colonIndex) : ''
      return namespace ? `${namespace}:${translation}` : translation
    }
    return tag
  })
}
