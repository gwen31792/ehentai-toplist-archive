// =============================================================================
// Database Client
// =============================================================================
export {
  createDbClient,
  type CloudflareDatabaseEnv,
  type DrizzleClient,
} from './client'

// =============================================================================
// Database Schema
// =============================================================================
export {
  galleriesTable,
} from './schema/galleries'

export {
  SUPPORTED_TOPLIST_YEARS,
  getToplistItemsTableByYear,
  type SupportedToplistYear,
  type ToplistItemsTable,
} from './schema/toplist-items'

// =============================================================================
// Types and Constants
// =============================================================================
export {
  TOPLIST_PERIOD_TYPES,
  type ToplistType,
  type Gallery,
  type ToplistItem,
  type QueryResponseItem,
} from './types'
