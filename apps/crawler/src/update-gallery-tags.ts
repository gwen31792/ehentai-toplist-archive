import { galleriesTable } from '@ehentai-toplist-archive/db'
import * as cheerio from 'cheerio'
import { asc, isNull, lt, or } from 'drizzle-orm'

import { cfFetch, delay, getDbClient } from './utils'

export const UPDATE_GALLERY_TAGS_MESSAGE = 'update-gallery-tags'

export async function handleUpdateGalleryTags(env: Env): Promise<void> {
  console.log('Update gallery tags task started.')
  const db = getDbClient(env)

  // 计算一个月前的日期
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const thresholdDate = oneMonthAgo.toISOString()

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
    .limit(5)
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
        continue
      }

      const html = await response.text()
      console.log(`Fetched page content, length: ${html.length}`)

      // TODO: Parse tags from html
      // TODO: Update gallery tags and updated_at in database

      // 避免请求过快
      await delay(1000)
    }
    catch (error) {
      console.error(`Error processing gallery ${gallery.gallery_id}:`, error)
    }
  }
}
