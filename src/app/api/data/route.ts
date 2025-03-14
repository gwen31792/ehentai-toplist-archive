export const runtime = 'edge';
import { drizzle } from 'drizzle-orm/d1'
import { galleriesTable, toplistItems2023Table, toplistItems2024Table, toplistItems2025Table } from '@/db/schema'
import { eq, and, getTableColumns } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const list_date_param = searchParams.get('list_date') as string
  const period_type_param = searchParams.get('period_type') as string

  const db = drizzle(getRequestContext().env.DB);

  // 根据传入的年份，选择对应的表
  const tableMap = {
    '2023': toplistItems2023Table,
    '2024': toplistItems2024Table,
    '2025': toplistItems2025Table,
  };
  const toplistItemsTable = tableMap[list_date_param.split('-')[0] as keyof typeof tableMap];


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { list_date, period_type, ...rest } = getTableColumns(toplistItemsTable)
  const result = await db.select(
    {
      ...rest,
      ...getTableColumns(galleriesTable),
    },
  )
    .from(toplistItemsTable)
    .where(
      and(
        eq(toplistItemsTable.list_date, list_date_param),
        eq(toplistItemsTable.period_type, period_type_param),
      ))
    .innerJoin(galleriesTable, eq(toplistItemsTable.gallery_id, galleriesTable.gallery_id))
    .orderBy(toplistItemsTable.rank)

  return Response.json(result)
}