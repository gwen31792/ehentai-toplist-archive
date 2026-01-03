import { dateStringSchema as baseDateStringSchema } from '@ehentai-toplist-archive/db'

const MIN_DATE_STR = '2023-11-15'

function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const monthStr = month < 10 ? `0${month}` : String(month)
  const dayStr = day < 10 ? `0${day}` : String(day)
  return `${year}-${monthStr}-${dayStr}`
}

/**
 * 日期字符串验证 schema（YYYY-MM-DD 格式）
 * 基于共享的 dateStringSchema（格式 + 有效日期），添加范围检查
 */
export const dateStringSchema = baseDateStringSchema.refine(
  (dateStr) => {
    const maxDateStr = toLocalDateString(new Date())
    return dateStr >= MIN_DATE_STR && dateStr <= maxDateStr
  },
  'Date out of range (must be between 2023-11-15 and today)',
)
