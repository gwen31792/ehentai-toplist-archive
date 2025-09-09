export type Language = 'en' | 'zh'
export type ToplistType = 'day' | 'month' | 'year' | 'all'

export interface Gallery {
  gallery_id: number
  gallery_name: string
  gallery_type: string
  tags: string
  published_time: string
  uploader: string
  gallery_length: number
  points: number
  torrents_url: string
  preview_url: string
  gallery_url: string
}

export interface QueryResponseItem extends Gallery {
  rank: number
}

export interface ContentType {
  en: {
    headers: {
      [key: string]: string
    }
    itemsPerPage: string
    page: string
    of: string
    description: string
    showPreview: string
  }
  zh: {
    headers: {
      [key: string]: string
    }
    itemsPerPage: string
    page: string
    of: string
    description: string
    showPreview: string
  }
}
