import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// =============================================================================
// 年份常量（Drizzle-first：这里是唯一数据源）
// =============================================================================

/**
 * 支持的 toplist 年份列表
 * 添加新年份时：在这里添加年份，toplistItemsTables 会自动更新
 */
export const SUPPORTED_TOPLIST_YEARS = [2023, 2024, 2025, 2026] as const

export type SupportedToplistYear = (typeof SUPPORTED_TOPLIST_YEARS)[number]

// =============================================================================
// Toplist Items 表定义
// =============================================================================

const createToplistItemsTable = (year: number) =>
  sqliteTable(`toplist_items_${year}`, {
    gallery_id: int().notNull(),
    rank: int().notNull(),
    list_date: text().notNull(),
    period_type: text().notNull(),
  })

const toplistItemsTables = {
  2023: createToplistItemsTable(2023),
  2024: createToplistItemsTable(2024),
  2025: createToplistItemsTable(2025),
  2026: createToplistItemsTable(2026),
} satisfies Record<SupportedToplistYear, ReturnType<typeof createToplistItemsTable>>

type ToplistItemsTableMap = typeof toplistItemsTables
export type ToplistItemsTable = ToplistItemsTableMap[SupportedToplistYear]

type YearInput = string | number

/**
 * 根据年份获取对应的 toplist_items 表
 * @throws Error 如果年份不在支持范围内
 */
export function getToplistItemsTableByYear(year: YearInput): ToplistItemsTable {
  const yearNum = typeof year === 'string'
    ? Number.parseInt(year.slice(0, 4), 10)
    : year

  if (!SUPPORTED_TOPLIST_YEARS.includes(yearNum as SupportedToplistYear)) {
    throw new Error(
      `Unsupported year: ${yearNum}. Must be one of: ${SUPPORTED_TOPLIST_YEARS.join(', ')}`,
    )
  }

  return toplistItemsTables[yearNum as SupportedToplistYear]
}
