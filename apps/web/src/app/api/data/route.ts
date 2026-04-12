import type { NextRequest } from 'next/server'

import {
  TOPLIST_PERIOD_TYPES,
  type PeriodType,
} from '@ehentai-toplist-archive/db'

import { queryToplistItems } from '@/lib/toplist-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listDateParam = searchParams.get('list_date')
  const periodTypeParam = searchParams.get('period_type')

  if (!listDateParam || !periodTypeParam) {
    return Response.json({ error: 'Missing required query parameters.' }, { status: 400 })
  }

  const isPeriodType = (value: string): value is PeriodType =>
    TOPLIST_PERIOD_TYPES.includes(value as PeriodType)

  if (!isPeriodType(periodTypeParam)) {
    return Response.json({ error: 'Invalid period_type value.' }, { status: 400 })
  }

  try {
    const result = await queryToplistItems(listDateParam, periodTypeParam)
    return Response.json(result)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unsupported year'
    return Response.json({ error: message }, { status: 400 })
  }
}
