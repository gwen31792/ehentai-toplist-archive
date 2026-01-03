import { dateStringSchema, galleryInsertSchema, periodTypeSchema } from '@ehentai-toplist-archive/db'
import { z } from 'zod'

// =============================================================================
// 解析结果验证 Schemas
// =============================================================================

/**
 * 从 HTML 解析出的 gallery 数据验证
 * 比 galleryInsertSchema 更严格：必须有有效的 gallery_id 和 gallery_name
 */
export const parsedGallerySchema = galleryInsertSchema.extend({
  gallery_id: z.number().int().positive('gallery_id must be positive'),
  gallery_name: z.string().min(1, 'gallery_name cannot be empty'),
})

/**
 * 从 HTML 解析出的 toplist item 数据验证
 */
export const parsedToplistItemSchema = z.object({
  gallery_id: z.number().int().positive('gallery_id must be positive'),
  rank: z.number().int().min(1).max(200),
  list_date: dateStringSchema,
  period_type: periodTypeSchema,
})

/**
 * parseToplistHtml 的返回值验证
 */
export const crawlResultSchema = z.object({
  galleries: z.array(parsedGallerySchema),
  toplistItems: z.array(parsedToplistItemSchema),
})

// =============================================================================
// update-gallery 解析结果 Schemas
// =============================================================================

/**
 * 从 gallery 详情页解析出的数据
 */
export const galleryDetailsSchema = z.object({
  tags: z.string().min(1).nullable(),
  galleryType: z.string().min(1).nullable(),
  publishedTime: dateStringSchema.nullable(),
  uploader: z.string().min(1).nullable(),
  galleryLength: z.number().int().positive().nullable(),
  torrentsUrl: z.url().nullable(),
  previewUrl: z.url().nullable(),
})

// =============================================================================
// GitHub API 响应 Schemas
// =============================================================================

/**
 * GitHub Release API 响应验证
 */
export const githubReleaseSchema = z.object({
  assets: z.array(z.object({
    name: z.string(),
    browser_download_url: z.string().url(),
  })),
})

/**
 * EhTagTranslation db.text.json 文件结构验证
 */
export const tagDbSchema = z.object({
  data: z.array(z.object({
    namespace: z.string(),
    data: z.record(z.string(), z.object({
      name: z.string(),
    })),
  })),
})

// =============================================================================
// 类型导出
// =============================================================================

export type ParsedGallery = z.infer<typeof parsedGallerySchema>
export type ParsedToplistItem = z.infer<typeof parsedToplistItemSchema>
export type CrawlResult = z.infer<typeof crawlResultSchema>
export type GalleryDetails = z.infer<typeof galleryDetailsSchema>
export type GithubRelease = z.infer<typeof githubReleaseSchema>
export type TagDb = z.infer<typeof tagDbSchema>
