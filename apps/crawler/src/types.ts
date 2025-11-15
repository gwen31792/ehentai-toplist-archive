import { galleriesTable, type ToplistItemsTable } from '@ehentai-toplist-archive/db'

import type { InferInsertModel } from 'drizzle-orm'

// 使用 Drizzle 推导的"插入模型"类型，避免与表结构漂移。
export type GalleryItem = InferInsertModel<typeof galleriesTable>
export type ToplistItem = InferInsertModel<ToplistItemsTable>

export interface CrawlResult {
  galleries: GalleryItem[]
  toplistItems: ToplistItem[]
}

// 用于在检测到需要立即停止后续请求的场景（例如被 Cloudflare 针对特定地区封锁）时抛出，
// 以便调用方可以按需中断整个爬取流程。
export class AbortCrawlError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'AbortCrawlError'
  }
}

export class TemporaryBanError extends Error {
  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'TemporaryBanError'
  }
}
