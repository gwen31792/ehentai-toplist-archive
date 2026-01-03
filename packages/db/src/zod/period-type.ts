import { z } from 'zod'

// =============================================================================
// 周期类型 Schema（对应数据库 period_type 字段）
// =============================================================================

/**
 * 周期类型验证 schema
 */
export const periodTypeSchema = z.enum(['day', 'month', 'year', 'all'])

/** 周期类型 */
export type PeriodType = z.infer<typeof periodTypeSchema>
