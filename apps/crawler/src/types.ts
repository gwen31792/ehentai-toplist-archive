// 类型从 zod schema 推导，确保运行时验证与类型一致
export type {
  ParsedGallery as GalleryItem,
  ParsedToplistItem as ToplistItem,
  CrawlResult,
  GalleryDetails,
} from './schemas'

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
