import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const galleriesTable = sqliteTable('galleries', {
  gallery_id: int().primaryKey(),  // 主键，唯一标识一个画廊
  gallery_name: text().notNull(),  // 画廊的标题
  gallery_type: text().notNull(),  // 最前面那个颜色方块，比如 western, misc
  tags: text().notNull(),  // 标签，用逗号分隔的一个字符串
  published_time: text().notNull(),  // 画廊的上传时间。注意格式是 yyyy-mm-dd，两位数
  uploader: text().notNull(),  // 上传者
  gallery_length: int().notNull(),  // 长度，比如 345 pages
  points: int().notNull(),  // 排序用的依据，在每一条的最左边
  torrents_url: text().notNull(),  // 下载种子页面的 url
  preview_url: text().notNull(),  // 封面的预览图的 url
  gallery_url: text().notNull(),  // gallery 的 url
});

export const toplistItems2023Table = sqliteTable('toplist_items_2023', {
  gallery_id: int().notNull(),  // 外键，引用 galleries 表，标识哪个画廊被包含在 toplist 中
  rank: int().notNull(),  // 画廊在toplist中的排名
  list_date: text().notNull(),  // 标识这个排名属于哪一天的 toplist。这是一个日期字段，可以用来区分不同日期的 toplist
  period_type: text().notNull(),  // 标识这是日 toplist、月 toplist 还是年 toplist 的记录。只能取 all, year, month, day
});

export const toplistItems2024Table = sqliteTable('toplist_items_2024', {
  gallery_id: int().notNull(),
  rank: int().notNull(),
  list_date: text().notNull(),
  period_type: text().notNull(),
});

export const toplistItems2025Table = sqliteTable('toplist_items_2025', {
  gallery_id: int().notNull(),
  rank: int().notNull(),
  list_date: text().notNull(),
  period_type: text().notNull(),
});
