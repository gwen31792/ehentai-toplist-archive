import { z } from 'zod'

// =============================================================================
// 周期类型（对应数据库 period_type 字段）
// =============================================================================

/** 支持的周期类型列表 */
export const TOPLIST_PERIOD_TYPES = ['day', 'month', 'year', 'all'] as const

/** 周期类型 */
export type PeriodType = (typeof TOPLIST_PERIOD_TYPES)[number]

/**
 * 周期类型验证 schema
 */
export const periodTypeSchema = z.enum(TOPLIST_PERIOD_TYPES)
