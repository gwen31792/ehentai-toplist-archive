import { createDbClient } from '@ehentai-toplist-archive/db'

export const NAMESPACE_ABBREVIATIONS: Record<string, string> = {
  artist: 'a',
  character: 'c',
  cosplayer: 'cos',
  female: 'f',
  group: 'g',
  language: 'l',
  location: 'loc',
  male: 'm',
  mixed: 'x',
  other: 'o',
  parody: 'p',
  reclass: 'r',
  // temp 不在 e-hentai 官方标签分类中
  temp: 't',
}

export function getDbClient(env: Env) {
  // Cloudflare Workers 的 env 对象是绑定到特定请求上下文的。
  // 虽然 Worker 实例可能会在多个请求之间复用，但 env 对象（及其包含的 DB 绑定）不能跨请求使用。
  // 如果将使用旧 env 创建的 client 缓存在全局变量中，当 Worker 复用于处理新请求时，
  // 尝试使用旧 client 执行 I/O 操作会触发 "Cannot perform I/O on behalf of a different request" 错误。
  // 因此，必须每次都使用当前请求传入的 env 创建新的 client 实例。
  return createDbClient(env)
}

export function getFetchStub(env: Env) {
  // 同理，Durable Object Stub 也绑定了创建它的请求上下文。
  // 必须在当前请求的上下文中获取 Stub，而不能复用之前请求创建的 Stub。
  const id = env.FETCH_DO.idFromName('fetch-proxy')
  return env.FETCH_DO.get(id, { locationHint: 'apac' })
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 451 响应不会附带详细错误信息，这里通过 Cloudflare trace 接口补充请求上下文，便于定位封锁来源。
export async function logCloudflareExecutionInfo(env: Env, response: Response, requestUrl: string): Promise<Record<string, string> | null> {
  const blockedHeaders = {
    cfRay: response.headers.get('cf-ray'),
    cfCacheStatus: response.headers.get('cf-cache-status'),
    server: response.headers.get('server'),
    date: response.headers.get('date'),
  }

  let traceInfo: Record<string, string> | null = null

  try {
    const traceResponse = await cfFetch(env, 'https://cloudflare.com/cdn-cgi/trace', { method: 'GET' })

    if (traceResponse.ok) {
      const traceText = await traceResponse.text()
      traceInfo = Object.fromEntries(
        traceText
          .trim()
          .split('\n')
          .map(line => line.split('='))
          .filter((parts): parts is [string, string] => parts.length === 2),
      )
    }
    else {
      console.warn('Failed to fetch Cloudflare trace info.', {
        status: traceResponse.status,
        statusText: traceResponse.statusText,
      })
    }
  }
  catch (error) {
    console.warn('Error while fetching Cloudflare trace info.', error)
  }

  let responseBodyPreview: string | null = null

  try {
    const text = await response.text()
    responseBodyPreview = text.length > 500 ? `${text.slice(0, 500)}…` : text
  }
  catch (error) {
    console.warn('Unable to read 451 response body for logging.', error)
  }

  console.error('Received 451 response when crawling toplist.', {
    requestUrl,
    blockedHeaders,
    traceInfo,
    responseBodyPreview,
  })

  return traceInfo
}

// 使用 Durable Object 代理发起外部请求，强制从 APAC 机房出站，减少 451 触发概率。
export async function cfFetch(env: Env, url: string, init?: RequestInit): Promise<Response> {
  const stub = getFetchStub(env)
  const proxyUrl = `https://internal/fetch-proxy?to=${encodeURIComponent(url)}`
  return stub.fetch(proxyUrl, init)
}
