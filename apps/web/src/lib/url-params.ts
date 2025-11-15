import { parse, isValid, isAfter, isBefore, startOfDay } from 'date-fns'

import { TOPLIST_PERIOD_TYPES, type ToplistType } from './types'

const MIN_DATE = new Date('2023-11-15')
const MAX_DATE = startOfDay(new Date())

/**
 * 解析 URL 中的日期字符串（YYYY-MM-DD）
 */
export function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null

  const parsed = parse(dateString, 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : null
}

/**
 * 验证日期是否在允许范围内
 */
export function validateDateRange(date: Date | null): date is Date {
  if (!date || !isValid(date)) return false
  return !isBefore(date, MIN_DATE) && !isAfter(date, MAX_DATE)
}

/**
 * 验证周期类型
 */
export function validatePeriodType(type: string | null): ToplistType {
  if (!type) return 'day'
  return TOPLIST_PERIOD_TYPES.includes(type as ToplistType) ? (type as ToplistType) : 'day'
}

/**
 * 从 URLSearchParams 获取验证后的参数
 */
export function getValidatedParams(searchParams: URLSearchParams) {
  const dateParam = searchParams.get('date')
  const typeParam = searchParams.get('period_type')

  const parsedDate = parseDate(dateParam)
  const validDate = validateDateRange(parsedDate) ? parsedDate : new Date()
  const validType = validatePeriodType(typeParam)

  return {
    date: validDate,
    type: validType,
    hasValidParams: parsedDate !== null && typeParam !== null,
  }
}
