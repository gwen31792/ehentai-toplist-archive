import * as cheerio from 'cheerio'

import { DrizzleQueryError } from 'drizzle-orm/errors'
import {
  createDbClient,
  galleriesTable,
  getToplistItemsTableByYear,
} from '@ehentai-toplist-archive/db'

let cachedDbClient: ReturnType<typeof createDbClient> | null = null

function getDbClient(env: Env) {
  if (cachedDbClient == null) {
    cachedDbClient = createDbClient(env)
  }

  return cachedDbClient
}

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

// 用于在检测到需要立即停止后续请求的场景（例如被 Cloudflare 针对特定地区封锁）时抛出，
// 以便调用方可以按需中断整个爬取流程。
export class AbortCrawlError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'AbortCrawlError'
  }
}

export async function getToplistSingle(env: Env, period_type: PeriodType, url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'GET',
    })

    if (response.status === 451) {
      // Cloudflare 会在 451 时返回受限地区信息，额外记录 trace 以判断是否因英国地区触发的封锁。
      const traceInfo = await logCloudflareExecutionInfo(response.clone(), url)

      if (traceInfo?.loc?.toUpperCase() === 'GB') {
        console.warn('Trace location resolved to GB after receiving 451; aborting remaining crawl tasks.', {
          requestUrl: url,
          traceInfo,
        })

        throw new AbortCrawlError('Cloudflare block originates from GB location.', {
          requestUrl: url,
          traceInfo,
          status: response.status,
        })
      }
    }

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

    if (error instanceof AbortCrawlError) {
      throw error
    }
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

  const db = getDbClient(env)

  if (galleries.length > 0) {
    const galleryStatements = galleries.map(gallery =>
      db.insert(galleriesTable).values(gallery).onConflictDoUpdate({
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
      }),
    )

    try {
      // cloudflare workers subrequest limit is 1000
      // 所以不能一条一条发请求，打包起来发能解决这个问题
      await db.batch(galleryStatements)
    }
    catch (error) {
      if (error instanceof DrizzleQueryError) {
        console.error(
          `Failed to batch upsert ${galleryStatements.length} galleries:`,
          error,
          error.cause,
        )
      }
      else {
        console.error(`Failed to batch upsert ${galleryStatements.length} galleries:`, error)
      }
    }
  }

  if (toplistItems.length > 0) {
    let table: ReturnType<typeof getToplistItemsTableByYear>

    try {
      table = getToplistItemsTableByYear(toplistItems[0].list_date)
    }
    catch (error) {
      console.error(`Unable to resolve toplist table for date ${toplistItems[0].list_date}:`, error)
      return
    }

    const toplistStatements = toplistItems.map(item =>
      db.insert(table).values(item).onConflictDoNothing(),
    )

    if (toplistStatements.length > 0) {
      try {
        await db.batch(toplistStatements)
      }
      catch (error) {
        const sample = toplistItems[0]
        if (error instanceof DrizzleQueryError) {
          console.error(
            `Failed to batch insert ${toplistStatements.length} toplist items for ${sample?.list_date ?? 'unknown date'} (${sample?.period_type ?? 'unknown period'}):`,
            error,
            error.cause,
          )
        }
        else {
          console.error(
            `Failed to batch insert ${toplistStatements.length} toplist items for ${sample?.list_date ?? 'unknown date'} (${sample?.period_type ?? 'unknown period'}):`,
            error,
          )
        }
      }
    }
  }

  console.log(`Persisted ${galleries.length} galleries and ${toplistItems.length} toplist rows.`)
}

// 451 响应不会附带详细错误信息，这里通过 Cloudflare trace 接口补充请求上下文，便于定位封锁来源。
async function logCloudflareExecutionInfo(response: Response, requestUrl: string): Promise<Record<string, string> | null> {
  const blockedHeaders = {
    cfRay: response.headers.get('cf-ray'),
    cfCacheStatus: response.headers.get('cf-cache-status'),
    server: response.headers.get('server'),
    date: response.headers.get('date'),
  }

  let traceInfo: Record<string, string> | null = null

  try {
    const traceResponse = await fetch('https://cloudflare.com/cdn-cgi/trace', {
      cf: {
        cacheTtl: 0,
        cacheEverything: false,
      },
    })

    if (traceResponse.ok) {
      const traceText = await traceResponse.text()
      traceInfo = Object.fromEntries(
        traceText
          .trim()
          .split('\n')
          .map(line => line.split('='))
          .filter((parts): parts is [string, string] => parts.length === 2),
      )
    }
    else {
      console.warn('Failed to fetch Cloudflare trace info.', {
        status: traceResponse.status,
        statusText: traceResponse.statusText,
      })
    }
  }
  catch (error) {
    console.warn('Error while fetching Cloudflare trace info.', error)
  }

  let responseBodyPreview: string | null = null

  try {
    const text = await response.text()
    responseBodyPreview = text.length > 500 ? `${text.slice(0, 500)}…` : text
  }
  catch (error) {
    console.warn('Unable to read 451 response body for logging.', error)
  }

  console.error('Received 451 response when crawling toplist.', {
    requestUrl,
    blockedHeaders,
    traceInfo,
    responseBodyPreview,
  })

  return traceInfo
}
