import * as cheerio from 'cheerio'

import {
  createDbClient,
  galleriesTable,
  getToplistItemsTableByYear,
} from '@ehentai-toplist-archive/db'

interface GalleryItem {
  gallery_id: number
  gallery_name: string
  gallery_type: string
  tags: string
  published_time: string
  uploader: string
  gallery_length: number
  points: number
  preview_url: string
  torrents_url: string
  gallery_url: string
}

type PeriodType = 'all' | 'year' | 'month' | 'day'

interface ToplistItem {
  gallery_id: number
  rank: number
  list_date: string
  period_type: PeriodType
}

interface CrawlResult {
  galleries: GalleryItem[]
  toplistItems: ToplistItem[]
}

export async function getToplistSingle(env: Env, period_type: PeriodType, url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()

    if (data.includes('This IP address has been temporarily banned')) {
      console.error(
        'Received temporary ban response while crawling toplist. Response body:',
        data,
      )
    }
    const { galleries, toplistItems } = await getToplistSingleFromResponse(data, period_type, null)
    await persistToplistData(env, galleries, toplistItems)
  }
  catch (error) {
    console.error('Error fetching toplist:', error)
  }
}

export async function getToplistSingleFromResponse(
  data: string,
  period_type: PeriodType,
  date: string | null,
): Promise<CrawlResult> {
  const $ = cheerio.load(data)
  const galleries: GalleryItem[] = []
  const toplist_items: ToplistItem[] = []

  $('tr').each((index, element) => {
    // 第一个从 2 开始
    if (index >= 2 && index <= 51) {
      const td_array = $(element).find('td')

      const rank = parseInt(
        $(td_array[0]).find('p').first().text().substring(1),
        10,
      )
      const points = parseInt(
        $(td_array[0]).find('p').eq(1).text().replace(/,/g, ''),
        10,
      )
      const gallery_type = $(td_array[1]).find('div').first().text()
      const gallery_name = $(td_array[2]).find('img').attr('alt') || ''
      const preview_url = $(td_array[2]).find('img').attr('src') || ''
      const published_time = $(td_array[2])
        .find('div')
        .find('div')
        .eq(1)
        .find('div')
        .eq(2)
        .text()
        .split(' ')[0]
      const gallery_length = parseInt(
        $(td_array[2])
          .find('div')
          .find('div')
          .eq(1)
          .find('div')
          .eq(3)
          .text()
          .match(/\d+/)?.[0] || '0',
        10,
      )

      const popUp = $(td_array[2])
        .find('div')
        .eq(4)
        .find('div')
        .eq(1)
        .attr('onclick')
      const gallery_id = parseInt(popUp?.match(/gid=(\d+)/)?.[1] || '0', 10)
      const torrentToken = popUp?.match(/&t=([0-9a-f]+)/)?.[1] || ''
      const torrents_url = `https://e-hentai.org/gallerytorrents.php?gid=${gallery_id}&t=${torrentToken}`

      const gallery_url = $(td_array[3]).find('a').attr('href') || ''

      const $divTags = $(td_array[3]).find('div').eq(1).find('div')
      const tags = $divTags
        .toArray()
        .map(el => $(el).text())
        .join(', ')

      const uploader = $(td_array[4]).find('a').text()

      let list_date: string
      if (date == null) {
        const now = new Date()
        const year = now.getUTCFullYear()
        const month = now.getUTCMonth() + 1
        const day = now.getUTCDate()

        const monthStr = month < 10 ? '0' + month : month
        const dayStr = day < 10 ? '0' + day : day

        list_date = `${year}-${monthStr}-${dayStr}`
      }
      else {
        list_date = date
      }

      const galleryItem: GalleryItem = {
        gallery_id,
        gallery_name,
        gallery_type,
        tags,
        published_time,
        uploader,
        gallery_length,
        points,
        preview_url,
        torrents_url,
        gallery_url,
      }
      galleries.push(galleryItem)

      const toplist_item: ToplistItem = {
        gallery_id,
        rank,
        list_date,
        period_type,
      }
      toplist_items.push(toplist_item)
    }
  })

  return {
    galleries,
    toplistItems: toplist_items,
  }
}

async function persistToplistData(env: Env, galleries: GalleryItem[], toplistItems: ToplistItem[]): Promise<void> {
  if (galleries.length === 0 && toplistItems.length === 0) {
    console.log('No data to persist; skipping database writes.')
    return
  }

  const db = createDbClient(env)

  for (const gallery of galleries) {
    if (!gallery.gallery_id) {
      console.warn('Skipping gallery with missing ID:', gallery)
      continue
    }
    try {
      await db.insert(galleriesTable).values(gallery).onConflictDoUpdate({
        target: galleriesTable.gallery_id,
        set: {
          gallery_name: gallery.gallery_name,
          gallery_type: gallery.gallery_type,
          tags: gallery.tags,
          published_time: gallery.published_time,
          uploader: gallery.uploader,
          gallery_length: gallery.gallery_length,
          points: gallery.points,
          torrents_url: gallery.torrents_url,
          preview_url: gallery.preview_url,
          gallery_url: gallery.gallery_url,
        },
      })
    }
    catch (error) {
      console.error(`Failed to upsert gallery ${gallery.gallery_id}:`, error)
    }
  }

  for (const item of toplistItems) {
    if (!item.gallery_id) {
      console.warn('Skipping toplist item with missing gallery ID:', item)
      continue
    }
    try {
      const table = getToplistItemsTableByYear(item.list_date)

      await db.insert(table).values(item).onConflictDoNothing()
    }
    catch (error) {
      console.error(`Failed to upsert toplist item for gallery ${item.gallery_id} on ${item.list_date} (${item.period_type}):`, error)
    }
  }

  console.log(`Persisted ${galleries.length} galleries and ${toplistItems.length} toplist rows.`)
}
