// =============================================================================
// Database Client
// =============================================================================
export { createDbClient } from './client'

// =============================================================================
// Database Schema（Drizzle 表定义）
// =============================================================================
export { galleriesTable } from './schema/galleries'

export { getToplistItemsTableByYear } from './schema/toplist-items'

// =============================================================================
// Types（从 Drizzle 推导）
// =============================================================================
export { type Gallery, type QueryResponseItem } from './types'

// =============================================================================
// Zod Schemas（从 Drizzle 生成 + 业务加强）
// =============================================================================
export {
  TOPLIST_PERIOD_TYPES,
  dateStringSchema,
  periodTypeSchema,
  type PeriodType,
  galleryInsertSchema,
} from './zod'
