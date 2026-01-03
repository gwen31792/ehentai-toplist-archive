import type { QueryResponseItem, PeriodType } from '@ehentai-toplist-archive/db'

export type { QueryResponseItem, PeriodType }

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
