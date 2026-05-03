import { galleriesTable } from './schema/galleries'
import { galleryPreviewAssetsTable } from './schema/gallery-preview-assets'

import type { InferSelectModel } from 'drizzle-orm'

// =============================================================================
// 从 Drizzle Schema 推导的类型
// =============================================================================

export type Gallery = InferSelectModel<typeof galleriesTable>

export type GalleryPreviewAsset = InferSelectModel<typeof galleryPreviewAssetsTable>

export interface QueryResponseItem extends Gallery {
  rank: number
}
