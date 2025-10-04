import { createDbClient } from '@ehentai-toplist-archive/db'

let cachedDbClient: ReturnType<typeof createDbClient> | null = null
let cachedFetchStub: DurableObjectStub | null = null

export function getDbClient(env: Env) {
  if (cachedDbClient == null) {
    cachedDbClient = createDbClient(env)
  }

  return cachedDbClient
}

export function getFetchStub(env: Env) {
  if (cachedFetchStub == null) {
    const id = env.FETCH_DO.idFromName('fetch-proxy')
    cachedFetchStub = env.FETCH_DO.get(id, { locationHint: 'apac' })
  }

  return cachedFetchStub
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
