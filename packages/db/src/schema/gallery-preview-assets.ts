import { sql } from 'drizzle-orm'
import { check, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const galleryPreviewAssetsTable = sqliteTable('gallery_preview_assets', {
  gallery_id: int().primaryKey(),
  source_url: text().notNull(),
  width: int(),
  height: int(),
  mime_type: text(),
  byte_size: int(),
  sync_status: text({ enum: ['synced', 'failed', 'skipped'] }).notNull().default('synced'),
  updated_at: text().notNull(),
}, table => [
  check(
    'gallery_preview_assets_width_positive',
    sql`${table.width} IS NULL OR ${table.width} > 0`,
  ),
  check(
    'gallery_preview_assets_height_positive',
    sql`${table.height} IS NULL OR ${table.height} > 0`,
  ),
  check(
    'gallery_preview_assets_byte_size_positive',
    sql`${table.byte_size} IS NULL OR ${table.byte_size} > 0`,
  ),
])
