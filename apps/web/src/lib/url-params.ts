/**
 * URL 参数验证工具
 *
 * 设计决策：使用简单函数而非 Zod
 *
 * 对于 URL 参数，"宽容"比"严格"更合适：
 * - 用户可能手动修改 URL、书签过期、时区不一致
 * - 这些是正常情况，不应该导致错误
 * - 无效参数静默 fallback 到默认值，用户体验不中断
 *
 * Zod 适合外部数据（爬虫解析 HTML），不适合这种场景。
 */

import { TOPLIST_PERIOD_TYPES, type PeriodType } from '@ehentai-toplist-archive/db'
import { isValid, parse } from 'date-fns'

const MIN_DATE = new Date(Date.UTC(2023, 10, 15)) // 2023-11-15 UTC

function getUtcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/**
 * 解析 URL 中的日期字符串（YYYY-MM-DD）为 UTC Date
 */
export function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null

  const parsed = parse(dateString, 'yyyy-MM-dd', new Date())
  if (!isValid(parsed)) return null

  // 转换为 UTC Date
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * 验证日期是否在允许范围内（使用 UTC）
 */
export function validateDateRange(date: Date | null): date is Date {
  if (!date || !isValid(date)) return false
  const maxDate = getUtcToday()
  return date >= MIN_DATE && date <= maxDate
}

/**
 * 验证周期类型，无效则返回默认值 'day'
 */
export function validatePeriodType(type: string | null): PeriodType {
  if (!type) return 'day'
  return TOPLIST_PERIOD_TYPES.includes(type as PeriodType) ? (type as PeriodType) : 'day'
}
