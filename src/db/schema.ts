import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
});

export const toplistItems2023Table = sqliteTable('toplist_items_2023', {
    gallery_id: int().notNull(),
    rank: int().notNull(),
    list_date: text().notNull(),
    period_type: text().notNull(),
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
