import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const galleriesTable = sqliteTable('galleries', {
  gallery_id: int().primaryKey(),
  gallery_name: text().notNull(),
  gallery_type: text().notNull(),
  tags: text().notNull(),
  published_time: text().notNull(),
  uploader: text().notNull(),
  gallery_length: int().notNull(),
  points: int().notNull(),
  torrents_url: text().notNull(),
  preview_url: text().notNull(),
  gallery_url: text().notNull(),
})
