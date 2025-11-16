import { CRAWL_TAGS_TRANSLATION_MESSAGE, handleTagsTranslationCrawling } from './crawl-tags-translation'
import { CRAWL_QUEUE_MESSAGE, handleToplistCrawling } from './crawl-toplist'

export default {
  async fetch(): Promise<Response> {
    return new Response('Forbidden', { status: 403 })
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // 定期向队列投递爬取任务，由队列消费者串行执行抓取逻辑。
    const enqueueToplist = env['ehentai-toplist-archive'].send(CRAWL_QUEUE_MESSAGE)
    const enqueueTagsTranslation = env['ehentai-toplist-archive'].send(CRAWL_TAGS_TRANSLATION_MESSAGE)

    await Promise.all([enqueueToplist, enqueueTagsTranslation])
  },

  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body

      switch (body) {
        case CRAWL_QUEUE_MESSAGE:
          try {
            await handleToplistCrawling(env)
          }
          catch (error) {
            console.error('Failed to process toplist crawling queue message.', error)
          }
          break

        case CRAWL_TAGS_TRANSLATION_MESSAGE:
          try {
            await handleTagsTranslationCrawling(env)
          }
          catch (error) {
            console.error('Failed to process tags translation crawling queue message.', error)
          }
          break

        default:
          console.warn('Discarding unexpected queue message payload.', { body })
          break
      }

      message.ack()
    }
  },
} satisfies ExportedHandler<Env>

// 用于在指定地区（APAC）代理外部请求的 Durable Object
export class FetchProxy implements DurableObject {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const to = url.searchParams.get('to')
      if (!to) {
        return Response.json({ error: 'Missing query param "to"' }, { status: 400 })
      }

      // 复用原请求的方法/请求头/请求体，仅替换目标 URL
      const forwardReq = new Request(to, request)
      // 避免抓取过程意外写入缓存
      const resp = await fetch(forwardReq, { cf: { cacheTtl: 0, cacheEverything: false } })
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers,
      })
    }
    catch (err) {
      console.error('FetchProxy error', err)
      return Response.json({ error: 'FetchProxy failed' }, { status: 502 })
    }
  }
}
