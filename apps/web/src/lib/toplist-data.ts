import {
  createDbClient,
  galleriesTable,
  galleryPreviewAssetsTable,
  getToplistItemsTableByYear,
  type PeriodType,
  type QueryResponseItem,
} from '@ehentai-toplist-archive/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { and, eq, getTableColumns } from 'drizzle-orm'

import { parseDate, validateDateRange, validatePeriodType } from '@/lib/url-params'

export interface ResolvedToplistParams {
  selectedDateString: string
  selectedType: PeriodType
}

function getUtcTodayDateString(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function resolveToplistParams({
  dateParam,
  periodTypeParam,
}: {
  dateParam: string | null
  periodTypeParam: string | null
}): ResolvedToplistParams {
  const parsedDate = parseDate(dateParam)

  return {
    selectedDateString: validateDateRange(parsedDate) && dateParam
      ? dateParam
      : getUtcTodayDateString(),
    selectedType: validatePeriodType(periodTypeParam),
  }
}

export async function queryToplistItems(
  listDate: string,
  periodType: PeriodType,
): Promise<QueryResponseItem[]> {
  const toplistItemsTable = getToplistItemsTableByYear(listDate)
  const db = createDbClient(getCloudflareContext().env)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { list_date, period_type, ...toplistColumns } = getTableColumns(toplistItemsTable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updated_at, ...galleryColumns } = getTableColumns(galleriesTable)

  const result = await db.select(
    {
      ...toplistColumns,
      ...galleryColumns,
      preview_width: galleryPreviewAssetsTable.width,
      preview_height: galleryPreviewAssetsTable.height,
    },
  )
    .from(toplistItemsTable)
    .innerJoin(galleriesTable, eq(toplistItemsTable.gallery_id, galleriesTable.gallery_id))
    .leftJoin(
      galleryPreviewAssetsTable,
      and(
        eq(galleryPreviewAssetsTable.gallery_id, galleriesTable.gallery_id),
        eq(galleryPreviewAssetsTable.source_url, galleriesTable.preview_url),
        eq(galleryPreviewAssetsTable.sync_status, 'synced'),
      ),
    )
    .where(
      and(
        eq(toplistItemsTable.list_date, listDate),
        eq(toplistItemsTable.period_type, periodType),
      ),
    )
    .orderBy(toplistItemsTable.rank)

  return result as QueryResponseItem[]
}
