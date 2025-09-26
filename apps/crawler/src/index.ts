import { getToplistSingle } from './crawler'

export default {
  async fetch(): Promise<Response> {
    try {
      await handleToplistCrawling()
      return new Response(JSON.stringify({ message: 'Toplist crawling completed' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    catch (error) {
      console.error('Error handling request:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },

  async scheduled(_controller: ScheduledController, _env: Env, ctx: ExecutionContext): Promise<void> {
    // 定期执行爬取任务
    ctx.waitUntil(handleToplistCrawling())
  },
} satisfies ExportedHandler<Env>

// 简单的延迟函数，用于控制请求节奏
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

async function handleToplistCrawling(): Promise<void> {
  const tasks = [
    ['all', 'https://e-hentai.org/toplist.php?tl=11'],
    ['all', 'https://e-hentai.org/toplist.php?tl=11&p=1'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12'],
    ['year', 'https://e-hentai.org/toplist.php?tl=12&p=1'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13'],
    ['month', 'https://e-hentai.org/toplist.php?tl=13&p=1'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15'],
    ['day', 'https://e-hentai.org/toplist.php?tl=15&p=1'],
  ] as const

  for (let i = 0; i < tasks.length; i++) {
    const [type, url] = tasks[i]
    await getToplistSingle(type, url)
    // 每个任务之间等待 1 秒，最后一个任务后不再等待
    if (i < tasks.length - 1) {
      await delay(1000)
    }
  }
}
