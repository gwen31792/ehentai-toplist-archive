import type { NextRequest } from 'next/server'

import {
  createDbClient,
  galleriesTable,
  getToplistItemsTableByYear,
} from '@ehentai-toplist-archive/db'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { eq, and, getTableColumns } from 'drizzle-orm'
import { z } from 'zod'

import { dataApiQuerySchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const parseResult = dataApiQuerySchema.safeParse({
    list_date: searchParams.get('list_date'),
    period_type: searchParams.get('period_type'),
  })

  if (!parseResult.success) {
    return Response.json({ error: z.flattenError(parseResult.error) }, { status: 400 })
  }

  const { list_date: listDateParam, period_type: periodTypeParam } = parseResult.data

  const toplistItemsTable = getToplistItemsTableByYear(listDateParam)
  const db = createDbClient(getCloudflareContext().env)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { list_date, period_type, ...rest } = getTableColumns(toplistItemsTable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updated_at, tags_zh, ...galleryColumns } = getTableColumns(galleriesTable)

  const queryResult = await db.select(
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

  return Response.json(queryResult)
}
