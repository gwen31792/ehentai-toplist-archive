export type { Gallery, QueryResponseItem, ToplistType } from '@ehentai-toplist-archive/db'
export { TOPLIST_PERIOD_TYPES } from '@ehentai-toplist-archive/db'

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
