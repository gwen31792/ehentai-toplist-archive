import { createInsertSchema } from 'drizzle-zod'

import { galleriesTable } from '../schema/galleries'

/**
 * Gallery 插入数据验证 schema（由 drizzle-zod 自动生成）
 */
export const galleryInsertSchema = createInsertSchema(galleriesTable)
