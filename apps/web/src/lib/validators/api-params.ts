import { periodTypeSchema } from '@ehentai-toplist-archive/db'
import { z } from 'zod'

import { dateStringSchema } from './url-params'

/**
 * /api/data 查询参数验证 schema
 * dateStringSchema 已验证格式、有效性、范围（2023-11-15 到今天）
 */
export const dataApiQuerySchema = z.object({
  list_date: dateStringSchema,
  period_type: periodTypeSchema,
})

export type DataApiQuery = z.infer<typeof dataApiQuerySchema>
