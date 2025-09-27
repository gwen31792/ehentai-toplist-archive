import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const createToplistItemsTable = (year: number) =>
  sqliteTable(`toplist_items_${year}`, {
    gallery_id: int().notNull(),
    rank: int().notNull(),
    list_date: text().notNull(),
    period_type: text().notNull(),
  })

export const SUPPORTED_TOPLIST_YEARS = [2023, 2024, 2025] as const
export type SupportedToplistYear = typeof SUPPORTED_TOPLIST_YEARS[number]

const toplistItemsTables = {
  2023: createToplistItemsTable(2023),
  2024: createToplistItemsTable(2024),
  2025: createToplistItemsTable(2025),
} satisfies Record<SupportedToplistYear, ReturnType<typeof createToplistItemsTable>>

type ToplistItemsTableMap = typeof toplistItemsTables
export type ToplistItemsTable = ToplistItemsTableMap[SupportedToplistYear]

type YearInput = string | number

function normalizeToplistYear(year: YearInput): SupportedToplistYear {
  const raw = typeof year === 'number' ? `${year}` : `${year}`
  const normalized = Number.parseInt(raw.slice(0, 4), 10)

  if (Number.isNaN(normalized)) {
    throw new Error(`Invalid toplist year: ${year}`)
  }

  if (!SUPPORTED_TOPLIST_YEARS.includes(normalized as SupportedToplistYear)) {
    throw new Error(`Unsupported toplist year: ${year}`)
  }

  return normalized as SupportedToplistYear
}

export function getToplistItemsTableByYear(year: YearInput): ToplistItemsTable {
  const normalizedYear = normalizeToplistYear(year)
  return toplistItemsTables[normalizedYear]
}
