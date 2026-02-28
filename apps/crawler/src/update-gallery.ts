import { galleriesTable } from '@ehentai-toplist-archive/db'
import * as cheerio from 'cheerio'
import { and, asc, count, eq, isNotNull, isNull, lt, or } from 'drizzle-orm'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { z } from 'zod'

import { galleryDetailsSchema } from './schemas'
import { TemporaryBanError } from './types'
import { delay, ehentaiFetch, getDbClient, NAMESPACE_ABBREVIATIONS, retryD1Operation } from './utils'

export const UPDATE_GALLERY_MESSAGE = 'update-gallery'

export async function handleUpdateGallery(env: Env): Promise<void> {
  console.log('Update gallery task started.')
  const db = getDbClient(env)

  // 计算一个月前的日期
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const thresholdDate = oneMonthAgo.toISOString().split('T')[0]

  const totalResult = await db
    .select({ count: count() })
    .from(galleriesTable)
    .where(
      and(
        isNotNull(galleriesTable.gallery_url),
        or(
          isNull(galleriesTable.updated_at),
          lt(galleriesTable.updated_at, thresholdDate),
        ),
      ),
    )
    .get()

  console.log(`Total galleries needing update: ${totalResult?.count ?? 0}`)

  // 查询 updated_at 为空 或者 updated_at 早于一个月前的 gallery，每次处理 100 条
  // SQLite 中 NULL 比任何值都小，所以 ASC 排序时 NULL 会排在最前面
  const galleries = await db
    .select()
    .from(galleriesTable)
    .where(
      and(
        isNotNull(galleriesTable.gallery_url),
        or(
          isNull(galleriesTable.updated_at),
          lt(galleriesTable.updated_at, thresholdDate),
        ),
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
    if (!gallery.gallery_url) continue
    console.log(`Processing gallery: ${gallery.gallery_id} - ${gallery.gallery_url}`)

    try {
      const response = await ehentaiFetch(env, gallery.gallery_url)

      if (!response.ok) {
        // 如果画廊不存在 (404) 或已删除 (410)，更新 updated_at 以避免重复重试
        if (response.status === 404 || response.status === 410) {
          console.warn(`Gallery ${gallery.gallery_id} is gone (${response.status}). Updating timestamp to skip future checks.`)
          // 使用当前时间更新，避免死循环
          await retryD1Operation(() =>
            db
              .update(galleriesTable)
              .set({ updated_at: new Date().toISOString().split('T')[0] })
              .where(eq(galleriesTable.gallery_id, gallery.gallery_id)),
          )
        }
        else {
          console.error(`Failed to fetch gallery page: ${response.status} ${response.statusText}`)
        }

        continue
      }

      const html = await response.text()
      console.log(`Fetched page content, length: ${html.length}`)

      if (html.includes('This IP address has been temporarily banned')) {
        console.error('Temporary ban detected. Stopping update-gallery task.')
        throw new TemporaryBanError('Temporary IP ban encountered while updating gallery.', {
          gallery_id: gallery.gallery_id,
          gallery_url: gallery.gallery_url,
        })
      }

      // 如果画廊页面显示 "Gallery not found."，只更新 updated_at
      if (html.includes('Gallery not found.')) {
        console.warn(`Gallery ${gallery.gallery_id} not found. Updating timestamp only.`)
        await retryD1Operation(() =>
          db
            .update(galleriesTable)
            .set({ updated_at: new Date().toISOString().split('T')[0] })
            .where(eq(galleriesTable.gallery_id, gallery.gallery_id)),
        )
        continue
      }

      const tags = parseGalleryTags(html, gallery.gallery_id)
      const galleryType = parseGalleryType(html)
      const publishedTime = parsePublishedTime(html)
      const uploader = parseUploader(html)
      const galleryLength = parseGalleryLength(html)
      const torrentsUrl = parseTorrentsUrl(html)
      const previewUrl = parsePreviewUrl(html)

      // 验证解析出的数据
      const parseResult = galleryDetailsSchema.safeParse({
        tags,
        galleryType,
        publishedTime,
        uploader,
        galleryLength,
        torrentsUrl,
        previewUrl,
      })

      if (!parseResult.success) {
        console.warn(
          `Invalid gallery details for gallery ${gallery.gallery_id}:`,
          z.flattenError(parseResult.error),
        )
        // 验证失败时只更新 updated_at，避免写入无效数据
        await retryD1Operation(() =>
          db
            .update(galleriesTable)
            .set({ updated_at: new Date().toISOString().split('T')[0] })
            .where(eq(galleriesTable.gallery_id, gallery.gallery_id)),
        )
        continue
      }

      const details = parseResult.data
      console.log(`Parsed details for gallery ${gallery.gallery_id}:`, details)

      // 从 KV 中批量读取标签翻译
      const tagsZh = await translateTags(env.KV, details.tags)
      console.log(`Translated tags for gallery ${gallery.gallery_id}:`, tagsZh)

      await retryD1Operation(() =>
        db
          .update(galleriesTable)
          .set({
            ...(details.tags && { tags: details.tags }),
            ...(tagsZh && { tags_zh: tagsZh }),
            ...(details.galleryType && { gallery_type: details.galleryType }),
            ...(details.publishedTime && { published_time: details.publishedTime }),
            ...(details.uploader && { uploader: details.uploader }),
            ...(details.galleryLength && { gallery_length: details.galleryLength }),
            ...(details.torrentsUrl && { torrents_url: details.torrentsUrl }),
            ...(details.previewUrl && { preview_url: details.previewUrl }),
            updated_at: new Date().toISOString().split('T')[0],
          })
          .where(eq(galleriesTable.gallery_id, gallery.gallery_id)),
      )

      // 避免请求过快，等待 5 秒
      await delay(5000)
    }
    catch (error) {
      if (error instanceof TemporaryBanError) {
        console.warn('Update gallery task terminated early due to temporary IP ban.', error.context)
        return
      }
      if (error instanceof DrizzleQueryError) {
        const cause = error.cause as Error | undefined
        console.error(`Drizzle error processing gallery ${gallery.gallery_id}:`, {
          message: error.message,
          query: error.query,
          params: error.params,
          causeMessage: cause?.message,
          causeStack: cause?.stack,
        })
        continue
      }
      console.error(`Error processing gallery ${gallery.gallery_id}:`, error)
    }
  }
}

function parseGalleryType(html: string): string | null {
  const $ = cheerio.load(html)
  const galleryType = $('#gdc > div').first().text().trim()
  return galleryType || null
}

function parsePublishedTime(html: string): string | null {
  const $ = cheerio.load(html)
  let publishedTime: string | null = null

  $('td.gdt1').each((_, td) => {
    if ($(td).text().trim() === 'Posted:') {
      const dateTimeText = $(td).next('td.gdt2').text().trim()
      // 只取年月日部分（前10个字符：YYYY-MM-DD）
      publishedTime = dateTimeText.substring(0, 10)
    }
  })

  return publishedTime || null
}

function parseUploader(html: string): string | null {
  const $ = cheerio.load(html)
  const gdnDiv = $('#gdn')

  // 检查是否为 (Disowned)
  const text = gdnDiv.text().trim()
  if (text === '(Disowned)') {
    return null
  }

  // 正常情况：获取第一个 a 标签的文本
  const uploader = gdnDiv.find('a').first().text().trim()
  return uploader || null
}

function parseGalleryLength(html: string): number | null {
  const $ = cheerio.load(html)
  let galleryLength: number | null = null

  $('td.gdt1').each((_, td) => {
    if ($(td).text().trim() === 'Length:') {
      const lengthText = $(td).next('td.gdt2').text().trim()
      // 提取数字部分（如 "889 pages" -> 889）
      const match = lengthText.match(/^(\d+)/)
      if (match) {
        galleryLength = parseInt(match[1], 10)
      }
    }
  })

  return galleryLength
}

function parseTorrentsUrl(html: string): string | null {
  const $ = cheerio.load(html)

  // 查找文本以 "Torrent Download" 开头的 <a> 标签
  const torrentLink = $('a').filter((_, a) => $(a).text().trim().startsWith('Torrent Download')).first()

  if (torrentLink.length === 0) {
    return null
  }

  const onclick = torrentLink.attr('onclick')
  if (!onclick) {
    return null
  }

  // 从 onclick 中提取 https:// 开头的 URL
  // 示例: return popUp('https://e-hentai.org/gallerytorrents.php?gid=2735599&amp;t=6996b4bce6',610,590)
  const match = onclick.match(/https?:\/\/[^']+/)
  if (!match) {
    return null
  }

  // cheerio 会自动解码 HTML 实体，再处理一下
  return match[0].replace(/&amp;/g, '&')
}

function parsePreviewUrl(html: string): string | null {
  const $ = cheerio.load(html)

  // 从 #gleft #gd1 > div 的 style 属性中提取 url(...)
  // 示例: background:transparent url(https://ehgt.org/w/01/370/52871-unblcotr.webp) 0 0 no-repeat
  const gd1Div = $('#gleft #gd1 > div').first()
  const style = gd1Div.attr('style')

  if (!style) {
    return null
  }

  // 匹配 url(...) 中的链接
  const match = style.match(/url\(([^)]+)\)/)
  if (!match) {
    return null
  }

  return match[1]
}

function parseGalleryTags(html: string, galleryId: number): string | null {
  const $ = cheerio.load(html)
  const tags: string[] = []

  $('#taglist table tbody tr').each((_, tr) => {
    const namespaceText = $(tr).find('td.tc').text().trim().replace(':', '')
    const namespace = NAMESPACE_ABBREVIATIONS[namespaceText] ?? namespaceText

    // 对于每个 namespace，优先使用 .gt 标签
    // 如果该 namespace 下没有 .gt 标签，则回退使用 .gtl 标签
    // 如果还没有，则回退使用 .gtw 标签
    const tagCell = $(tr).find('td').not('.tc')
    const gtDivs = tagCell.find('div.gt')
    const gtlDivs = tagCell.find('div.gtl')
    const gtwDivs = tagCell.find('div.gtw')
    const targetDivs = gtDivs.length > 0 ? gtDivs : (gtlDivs.length > 0 ? gtlDivs : gtwDivs)

    targetDivs.each((_, div) => {
      const tag = $(div).find('a').text().trim()
      if (tag) {
        tags.push(`${namespace}:${tag}`)
      }
    })
  })

  if (tags.length === 0) {
    // 可能是 gallery 过于小众，需要手动给它们加个 tag
    // 例子：https://e-hentai.org/g/508505/6b3c6730f0/
    console.error(`No tags found for gallery ${galleryId}.`)
    return null
  }

  return tags.join(', ')
}

/**
 * 从 KV 中批量读取标签翻译
 * @param kv KV namespace binding
 * @param tagsString 原始标签字符串（格式：prefix:tag, prefix:tag, ...）
 * @returns 翻译后的标签字符串，未找到翻译的标签保留原值
 */
async function translateTags(kv: KVNamespace, tagsString: string | null): Promise<string | null> {
  if (!tagsString) {
    return null
  }

  const tags = tagsString.split(', ')

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
  const translatedTags = tags.map((tag) => {
    const translation = translationMap.get(tag)
    if (translation) {
      // 提取 namespace 前缀
      const colonIndex = tag.indexOf(':')
      const namespace = colonIndex > -1 ? tag.substring(0, colonIndex) : ''
      return namespace ? `${namespace}:${translation}` : translation
    }
    return tag
  })

  return translatedTags.join(', ')
}
