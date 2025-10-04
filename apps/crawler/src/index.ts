import { AbortCrawlError, TemporaryBanError, crawlToplistPage } from './crawler'
import { delay } from './utils'

const CRAWL_QUEUE_MESSAGE = 'crawl-toplists'
const RECOVERY_RETRY_DELAY_SECONDS = 3600

export default {
  async fetch(): Promise<Response> {
    return new Response('Forbidden', { status: 403 })
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // 定期向队列投递爬取任务，由队列消费者串行执行抓取逻辑。
    const enqueue = env['ehentai-toplist-archive'].send(CRAWL_QUEUE_MESSAGE)

    await enqueue
  },

  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body

      if (body !== CRAWL_QUEUE_MESSAGE) {
        console.warn('Discarding unexpected queue message payload.', { body })
        message.ack()
        continue
      }

      try {
        await handleToplistCrawling(env)
        message.ack()
      }
      catch (error) {
        console.error('Failed to process toplist crawling queue message.', error)
        message.ack()
      }
    }
  },
} satisfies ExportedHandler<Env>

async function handleToplistCrawling(env: Env): Promise<void> {
  const tasks = [
    ['all', 'https://e-hentai.org/toplist.php?tl=11'],
    ['all', 'https://e-hentai.org/toplist.php?tl=11&p=1'],
    ['all', 'https://e-hentai.org/toplist.php?tl=11&p=2'],
    ['all', 'https://e-hentai.org/toplist.php?tl=11&p=3'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12&p=1'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12&p=2'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12&p=3'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13&p=1'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13&p=2'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13&p=3'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15&p=1'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15&p=2'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15&p=3'],
  ] as const

  try {
    for (let i = 0; i < tasks.length; i++) {
      const [type, url] = tasks[i]
      await crawlToplistPage(env, type, url)
      // 每个任务之间等待 1 秒，最后一个任务后不再等待
      if (i < tasks.length - 1) {
        await delay(1000)
      }
    }
  }
  catch (error) {
    if (error instanceof TemporaryBanError) {
      console.warn('Toplist crawling halted due to temporary IP ban; scheduling retry.', error.context)
      try {
        await env['ehentai-toplist-archive'].send(CRAWL_QUEUE_MESSAGE, {
          delaySeconds: RECOVERY_RETRY_DELAY_SECONDS,
        })
        console.info('Re-enqueued toplist crawl after temporary ban.', {
          delaySeconds: RECOVERY_RETRY_DELAY_SECONDS,
        })
      }
      catch (enqueueError) {
        console.error('Failed to enqueue toplist crawl retry after temporary ban.', enqueueError)
      }
      return
    }

    if (error instanceof AbortCrawlError) {
      // 命中英国地区触发的 Cloudflare 451 封锁时，立即终止剩余任务以避免继续命中限制。
      console.warn('Toplist crawling terminated early due to GB-based Cloudflare block.', error.context)
      return
    }

    throw error
  }
}

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
