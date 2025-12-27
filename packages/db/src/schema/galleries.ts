// 原始建表内容：https://github.com/gwen31792/ehentai-toplist-archive/blob/e3cd17cc1c7cc0bfaaf6dbe4352ac6ba62bef67f/apps/web/src/db/mock.sql

import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const galleriesTable = sqliteTable('galleries', {
  gallery_id: int().primaryKey(),
  gallery_name: text(),
  gallery_type: text(),
  tags: text(),
  tags_zh: text(),
  published_time: text(),
  uploader: text(),
  gallery_length: int(),
  points: int(),
  torrents_url: text(),
  preview_url: text(),
  gallery_url: text(),
  updated_at: text(),
})
