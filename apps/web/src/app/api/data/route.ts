import type { NextRequest } from 'next/server'

import {
  createDbClient,
  galleriesTable,
  getToplistItemsTableByYear,
  TOPLIST_PERIOD_TYPES,
  type ToplistType,
} from '@ehentai-toplist-archive/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { eq, and, getTableColumns } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listDateParam = searchParams.get('list_date')
  const periodTypeParam = searchParams.get('period_type')

  if (!listDateParam || !periodTypeParam) {
    return Response.json({ error: 'Missing required query parameters.' }, { status: 400 })
  }

  const isToplistType = (value: string): value is ToplistType =>
    TOPLIST_PERIOD_TYPES.includes(value as ToplistType)

  if (!isToplistType(periodTypeParam)) {
    return Response.json({ error: 'Invalid period_type value.' }, { status: 400 })
  }

  let toplistItemsTable
  try {
    toplistItemsTable = getToplistItemsTableByYear(listDateParam)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unsupported year'
    return Response.json({ error: message }, { status: 400 })
  }

  const db = createDbClient(getCloudflareContext().env)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { list_date, period_type, ...rest } = getTableColumns(toplistItemsTable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updated_at, ...galleryColumns } = getTableColumns(galleriesTable)

  const result = await db.select(
    {
      ...rest,
      ...galleryColumns,
    },
  )
    .from(toplistItemsTable)
    .where(
      and(
        eq(toplistItemsTable.list_date, listDateParam),
        eq(toplistItemsTable.period_type, periodTypeParam),
      ))
    .innerJoin(galleriesTable, eq(toplistItemsTable.gallery_id, galleriesTable.gallery_id))
    .orderBy(toplistItemsTable.rank)

  return Response.json(result)
}
