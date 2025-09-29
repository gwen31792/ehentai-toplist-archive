import { AbortCrawlError, getToplistSingle } from './crawler'

// 环境绑定：D1 数据库与 Durable Object 命名空间
declare global {
  interface Env {
    DB: D1Database
    FETCH_DO: DurableObjectNamespace
  }
}

export default {
  async fetch(): Promise<Response> {
    return new Response('Forbidden', { status: 403 })
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // 定期执行爬取任务
    ctx.waitUntil(handleToplistCrawling(env))
  },
} satisfies ExportedHandler<Env>

// 简单的延迟函数，用于控制请求节奏
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

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
      await getToplistSingle(env, type, url)
      // 每个任务之间等待 1 秒，最后一个任务后不再等待
      if (i < tasks.length - 1) {
        await delay(1000)
      }
    }
  }
  catch (error) {
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
