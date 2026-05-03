import { galleriesTable, galleryPreviewAssetsTable } from '@ehentai-toplist-archive/db'
import { and, eq, isNotNull, isNull, ne, or } from 'drizzle-orm'
import { imageDimensionsFromStream } from 'image-dimensions'

import { cfFetch, getDbClient, retryD1Operation } from './utils'

export const SYNC_PREVIEW_ASSETS_MESSAGE = 'sync-preview-assets'

// 预览图探测是派生缓存任务，默认小批量低并发，避免拖慢主抓取队列或放大外部请求量。
const PREVIEW_ASSET_BATCH_SIZE = 20
const PREVIEW_ASSET_CONCURRENCY = 3
const PREVIEW_ASSET_REQUEUE_DELAY_SECONDS = 60

export interface PreviewAssetInput {
  gallery_id: number
  source_url: string | null | undefined
}

export interface PreviewAssetSyncStats {
  selected: number
  synced: number
  skipped: number
  failed: number
}

type PreviewAssetSyncResult
  = | { status: 'synced' }
    | { status: 'failed', error: string }
    | { status: 'skipped', reason: 'invalid-url' | 'stale-url' }

interface PreviewAssetMetadata {
  width: number
  height: number
  mime_type: string | null
  byte_size: number | null
}

function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

function normalizeContentType(contentType: string | null): string | null {
  // 只持久化 MIME 主体，去掉 charset 等参数，方便后续 Web 侧直接使用或比较。
  return contentType?.split(';')[0]?.trim().toLowerCase() || null
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value) {
    return null
  }

  // 响应头来自外部站点，只接受安全的正整数，避免把异常 header 写成有效字节数。
  const parsed = Number.parseInt(value, 10)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function getPreviewAssetSourceText(sourceUrl: string | null | undefined): string | null {
  const normalized = sourceUrl?.trim()
  return normalized || null
}

function getPreviewAssetUrl(sourceUrl: string | null | undefined): string | null {
  // 只允许真正可抓取的 http/https URL；空字符串和其他协议都视为无需同步。
  const normalized = getPreviewAssetSourceText(sourceUrl)

  if (!normalized) {
    return null
  }

  try {
    const url = new URL(normalized)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? normalized
      : null
  }
  catch {
    return null
  }
}

function formatPreviewAssetError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

// 查询当前缺少缓存或 preview_url 已变化的 gallery；这个任务只关心当前 URL，不读取 updated_at 水位。
export async function listGalleryPreviewAssetsToSync(
  env: Env,
  limit = PREVIEW_ASSET_BATCH_SIZE,
): Promise<PreviewAssetInput[]> {
  const db = getDbClient(env)

  // 调用方传入异常 limit 时回落到默认批次，避免意外跑成无界查询。
  const safeLimit = Number.isSafeInteger(limit) && limit > 0
    ? limit
    : PREVIEW_ASSET_BATCH_SIZE

  return retryD1Operation(() =>
    db
      .select({
        gallery_id: galleriesTable.gallery_id,
        source_url: galleriesTable.preview_url,
      })
      .from(galleriesTable)
      .leftJoin(
        galleryPreviewAssetsTable,
        eq(galleryPreviewAssetsTable.gallery_id, galleriesTable.gallery_id),
      )
      .where(
        and(
          isNotNull(galleriesTable.preview_url),
          ne(galleriesTable.preview_url, ''),
          or(
            isNull(galleryPreviewAssetsTable.gallery_id),
            ne(galleryPreviewAssetsTable.source_url, galleriesTable.preview_url),
          ),
        ),
      )
      .limit(safeLimit)
      .all(),
  )
}

async function fetchPreviewAssetMetadata(env: Env, previewAssetUrl: string): Promise<PreviewAssetMetadata> {
  // 预览图资源本身不需要 E-Hentai 登录态，沿用 cfFetch 只控制出站位置，不额外携带 cookie。
  const response = await cfFetch(env, previewAssetUrl, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`Preview asset request failed: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('Preview asset response did not include a readable body.')
  }

  // image-dimensions 会尽量只读取识别尺寸所需的前段字节，避免把整张预览图加载进内存。
  const dimensions = await imageDimensionsFromStream(response.body)

  if (!dimensions) {
    throw new Error('Preview asset has unsupported or invalid image data.')
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
    // 部分图片响应可能没有完整 header，尺寸是核心字段，MIME 和字节数允许为空。
    mime_type: normalizeContentType(response.headers.get('content-type')),
    byte_size: parsePositiveInteger(response.headers.get('content-length')),
  }
}

// 固定小并发执行图片探测，避免历史回填时一次性打出过多外部请求。
async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        // JS Worker 单线程执行这段索引分配，先递增再 await，避免同一条任务被多个 worker 领取。
        const item = items[nextIndex] as T
        nextIndex += 1
        await worker(item)
      }
    },
  )

  await Promise.all(workers)
}

// 对传入的预览图 URL 执行一次完整探测；无效/过期/抓取失败会落库成终态，写库错误交给调用方记录。
export async function syncGalleryPreviewAsset(
  env: Env,
  input: PreviewAssetInput,
): Promise<PreviewAssetSyncResult> {
  const sourceUrl = getPreviewAssetSourceText(input.source_url)

  if (!sourceUrl) {
    throw new Error('Preview asset source URL is empty.')
  }

  const previewAssetUrl = getPreviewAssetUrl(sourceUrl)
  const db = getDbClient(env)

  // 队列查询和图片探测之间可能间隔较久，写入前重新读取当前 URL，防止过期尺寸覆盖新图。
  const currentGallery = await retryD1Operation(() =>
    db
      .select({ preview_url: galleriesTable.preview_url })
      .from(galleriesTable)
      .where(eq(galleriesTable.gallery_id, input.gallery_id))
      .get(),
  )

  // 预览图尺寸必须绑定当前持久化 URL；过期输入只记录旧 URL，下一轮会处理新的当前 URL。
  if (getPreviewAssetSourceText(currentGallery?.preview_url) !== sourceUrl) {
    const updatedAt = getCurrentTimestamp()

    await retryD1Operation(() =>
      db
        .insert(galleryPreviewAssetsTable)
        .values({
          gallery_id: input.gallery_id,
          source_url: sourceUrl,
          width: null,
          height: null,
          mime_type: null,
          byte_size: null,
          sync_status: 'skipped',
          updated_at: updatedAt,
        })
        .onConflictDoUpdate({
          target: galleryPreviewAssetsTable.gallery_id,
          set: {
            source_url: sourceUrl,
            width: null,
            height: null,
            mime_type: null,
            byte_size: null,
            sync_status: 'skipped',
            updated_at: updatedAt,
          },
        }),
    )

    return { status: 'skipped', reason: 'stale-url' }
  }

  if (!previewAssetUrl) {
    const updatedAt = getCurrentTimestamp()

    await retryD1Operation(() =>
      db
        .insert(galleryPreviewAssetsTable)
        .values({
          gallery_id: input.gallery_id,
          source_url: sourceUrl,
          width: null,
          height: null,
          mime_type: null,
          byte_size: null,
          sync_status: 'skipped',
          updated_at: updatedAt,
        })
        .onConflictDoUpdate({
          target: galleryPreviewAssetsTable.gallery_id,
          set: {
            source_url: sourceUrl,
            width: null,
            height: null,
            mime_type: null,
            byte_size: null,
            sync_status: 'skipped',
            updated_at: updatedAt,
          },
        }),
    )

    return { status: 'skipped', reason: 'invalid-url' }
  }

  let metadata: PreviewAssetMetadata

  try {
    metadata = await fetchPreviewAssetMetadata(env, previewAssetUrl)
  }
  catch (error) {
    const errorMessage = formatPreviewAssetError(error)
    const updatedAt = getCurrentTimestamp()

    await retryD1Operation(() =>
      db
        .insert(galleryPreviewAssetsTable)
        .values({
          gallery_id: input.gallery_id,
          source_url: previewAssetUrl,
          width: null,
          height: null,
          mime_type: null,
          byte_size: null,
          sync_status: 'failed',
          updated_at: updatedAt,
        })
        .onConflictDoUpdate({
          target: galleryPreviewAssetsTable.gallery_id,
          set: {
            source_url: previewAssetUrl,
            width: null,
            height: null,
            mime_type: null,
            byte_size: null,
            sync_status: 'failed',
            updated_at: updatedAt,
          },
        }),
    )

    return { status: 'failed', error: errorMessage }
  }

  // gallery_id 是缓存表主键；同一个 gallery 的预览图变化时直接刷新派生元数据。
  const updatedAt = getCurrentTimestamp()

  await retryD1Operation(() =>
    db
      .insert(galleryPreviewAssetsTable)
      .values({
        gallery_id: input.gallery_id,
        source_url: previewAssetUrl,
        width: metadata.width,
        height: metadata.height,
        mime_type: metadata.mime_type,
        byte_size: metadata.byte_size,
        sync_status: 'synced',
        updated_at: updatedAt,
      })
      .onConflictDoUpdate({
        target: galleryPreviewAssetsTable.gallery_id,
        set: {
          source_url: previewAssetUrl,
          width: metadata.width,
          height: metadata.height,
          mime_type: metadata.mime_type,
          byte_size: metadata.byte_size,
          sync_status: 'synced',
          updated_at: updatedAt,
        },
      }),
  )

  return { status: 'synced' }
}

// 独立队列入口：挑一小批待同步 gallery，以固定并发补齐缓存，并把失败限制在单条记录内。
export async function handleSyncPreviewAssets(env: Env): Promise<PreviewAssetSyncStats> {
  console.log('Preview asset sync task started.')

  const galleries = await listGalleryPreviewAssetsToSync(env, PREVIEW_ASSET_BATCH_SIZE)
  const stats: PreviewAssetSyncStats = {
    selected: galleries.length,
    synced: 0,
    skipped: 0,
    failed: 0,
  }

  if (galleries.length === 0) {
    console.log('No gallery preview assets need sync.', stats)
    return stats
  }

  await runWithConcurrency(galleries, PREVIEW_ASSET_CONCURRENCY, async (gallery) => {
    try {
      const result = await syncGalleryPreviewAsset(env, gallery)

      if (result.status === 'synced') {
        stats.synced += 1
        return
      }

      if (result.status === 'failed') {
        stats.failed += 1
        console.error('Failed to sync gallery preview asset.', {
          gallery_id: gallery.gallery_id,
          source_url: gallery.source_url,
          error: result.error,
          batch_size: galleries.length,
        })
        return
      }

      stats.skipped += 1
      console.warn('Skipped gallery preview asset sync.', {
        gallery_id: gallery.gallery_id,
        source_url: gallery.source_url,
        reason: result.reason,
        batch_size: galleries.length,
      })
    }
    catch (error) {
      // 写入终态失败时不计入推进数量，避免用未落库结果触发续跑。
      console.error('Failed to persist gallery preview asset sync result.', {
        gallery_id: gallery.gallery_id,
        source_url: gallery.source_url,
        error: formatPreviewAssetError(error),
        batch_size: galleries.length,
      })
    }
  })

  console.log('Preview asset sync task finished.', stats)

  // 只有打满批次且本轮确实推进过时才续跑，避免一批长期失败 URL 形成高频自旋。
  if (galleries.length === PREVIEW_ASSET_BATCH_SIZE && stats.synced + stats.failed + stats.skipped > 0) {
    try {
      await env.QUEUE.send(SYNC_PREVIEW_ASSETS_MESSAGE, {
        delaySeconds: PREVIEW_ASSET_REQUEUE_DELAY_SECONDS,
      })
      console.info('Re-enqueued preview asset sync for remaining backlog.', {
        delaySeconds: PREVIEW_ASSET_REQUEUE_DELAY_SECONDS,
      })
    }
    catch (error) {
      console.error('Failed to enqueue follow-up preview asset sync.', error)
    }
  }

  return stats
}
