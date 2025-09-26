import * as cheerio from 'cheerio'

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

export async function getToplistSingle(period_type: PeriodType, url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()
    await getToplistSingleFromResponse(data, period_type, null)
  }
  catch (error) {
    console.error('Error fetching toplist:', error)
  }
}

export async function getToplistSingleFromResponse(
  data: string,
  period_type: PeriodType,
  date: string | null,
): Promise<void> {
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

  // 输出爬取结果
  console.log(`Successfully crawled ${galleries.length} items for ${period_type} period`)
  console.log('Sample gallery:', galleries[0])
  console.log('Sample toplist item:', toplist_items[0])
}
