import { TOPLIST_PERIOD_TYPES } from '@ehentai-toplist-archive/db'

import type { Gallery, QueryResponseItem, ToplistType } from '@ehentai-toplist-archive/db'

export type { Gallery, QueryResponseItem, ToplistType }
export { TOPLIST_PERIOD_TYPES }

export interface SearchParams {
  date?: string
  period_type?: string
  [key: string]: string | string[] | undefined
}

export interface ValidatedSearchParams {
  date: Date
  type: ToplistType
  hasValidParams: boolean
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
