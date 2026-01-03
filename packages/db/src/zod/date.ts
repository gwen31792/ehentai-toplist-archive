import { z } from 'zod'

/**
 * 日期字符串验证 schema（YYYY-MM-DD）
 * 验证格式 + 日期本身有效性（例如 2024-02-30 会失败）
 *
 * 说明：这里只做"日期是否存在"的验证，不做范围限制；
 * 范围（例如最小日期/最大日期）应由业务侧在此基础上 refine。
 */
export const dateStringSchema = z.iso.date()
