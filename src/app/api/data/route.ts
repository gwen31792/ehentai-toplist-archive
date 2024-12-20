// TODO: cloudflare workers runtime using env vars
// https://github.com/cloudflare/next-on-pages/issues/760
export const runtime = 'edge';
import { drizzle } from 'drizzle-orm/d1'
import { galleriesTable, toplistItems2023Table } from '@/db/schema'
import { eq, and, getTableColumns } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const list_date_param = searchParams.get('list_date') as string
    const period_type_param = searchParams.get('period_type') as string

    const db = drizzle(process.env.DB);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { list_date, period_type, ...rest } = getTableColumns(toplistItems2023Table)
    const result = await db.select(
        {
            ...rest,
            ...getTableColumns(galleriesTable),
        }
    )
        .from(toplistItems2023Table)
        .where(
            and(
                eq(toplistItems2023Table.list_date, list_date_param),
                eq(toplistItems2023Table.period_type, period_type_param),
            ))
        .innerJoin(galleriesTable, eq(toplistItems2023Table.gallery_id, galleriesTable.gallery_id))
        .orderBy(toplistItems2023Table.rank)

    return Response.json(result)
}