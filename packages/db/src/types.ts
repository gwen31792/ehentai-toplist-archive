import { galleriesTable } from './schema/galleries'

import type { InferSelectModel } from 'drizzle-orm'

// =============================================================================
// 从 Drizzle Schema 推导的类型
// =============================================================================

export type Gallery = InferSelectModel<typeof galleriesTable>

export interface QueryResponseItem extends Gallery {
  rank: number
}
