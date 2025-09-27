import type { InferSelectModel } from 'drizzle-orm'

import { galleriesTable } from './schema/galleries'
import type { SupportedToplistYear, ToplistItemsTable } from './schema/toplist-items'

export const TOPLIST_PERIOD_TYPES = ['day', 'month', 'year', 'all'] as const
export type ToplistType = typeof TOPLIST_PERIOD_TYPES[number]

export type Gallery = InferSelectModel<typeof galleriesTable>
export type ToplistItem = InferSelectModel<ToplistItemsTable>

export interface QueryResponseItem extends Gallery {
  rank: number
}

export type { SupportedToplistYear }
