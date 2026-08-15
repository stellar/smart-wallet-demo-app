import http, { IncomingHttpHeaders } from 'http'

import { request, Dispatcher } from 'undici'

import { logger } from './logger'

// Headers that must not be forwarded upstream or downstream
const HOP_BY_HOP = new Set([
  'connection',
  'host',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'keep-alive',
])

function buildUpstreamHeaders(incoming: IncomingHttpHeaders, bodyLength: number): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(incoming)) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    if (value === undefined) continue
    headers[key] = Array.isArray(value) ? value.join(', ') : value
  }
  if (bodyLength > 0) {
    headers['content-length'] = String(bodyLength)
    if (!headers['content-type']) headers['content-type'] = 'application/json'
  }
  return headers
}

function buildDownstreamHeaders(
  upstream: Record<string, string | string[] | undefined>,
  bodyLength: number
): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(upstream)) {
    if (HOP_BY_HOP.has(key)) continue
    // The body is forwarded byte-for-byte (undici.request never decompresses),
    // so content-encoding stays valid; content-length is restated from the buffer
    // to also cover upstreams that responded with chunked transfer encoding.
    if (key === 'content-length') continue
    if (value === undefined) continue
    headers[key] = value
  }
  headers['content-length'] = String(bodyLength)
  return headers
}

async function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Provider URLs can embed API keys (e.g. Liquify's `/api=<key>/`). Never let a full
// provider URL reach a log line or an HTTP response — only the hostname identifies
// which provider failed without disclosing the credential.
export function redactProvider(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return '[invalid-provider-url]'
  }
}

const GET_HEALTH_BODY = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' })

export async function checkRpcReadiness(
  providers: string[],
  timeout: number
): Promise<{ ready: boolean; reachable: string | null; failures: string[] }> {
  const failures: string[] = []
  for (const provider of providers) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(provider, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: GET_HEALTH_BODY,
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (res.ok) return { ready: true, reachable: redactProvider(provider), failures }
      failures.push(`${redactProvider(provider)}: HTTP ${res.status}`)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'AbortError' ? 'timeout' : err instanceof Error ? err.message : String(err)
      failures.push(`${redactProvider(provider)}: ${msg}`)
    }
  }
  return { ready: false, reachable: null, failures }
}

export async function proxyWithFallback(
  providers: string[],
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: { timeout: number; mode: 'rpc' | 'horizon' }
): Promise<void> {
  const body = await readBody(req)
  const upstreamHeaders = buildUpstreamHeaders(req.headers, body.length)

  let lastError = 'No providers configured'

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]

    try {
      const url = options.mode === 'rpc' ? provider : `${provider.replace(/\/$/, '')}${req.url ?? '/'}`

      if (i > 0) {
        logger.warn(`[${options.mode}] provider[${i - 1}] failed → trying ${redactProvider(provider)}`)
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), options.timeout)

      const upstream = await request(url, {
        method: (req.method ?? 'GET') as Dispatcher.HttpMethod,
        headers: upstreamHeaders,
        body: body.length > 0 ? body : undefined,
        signal: controller.signal,
      })

      clearTimeout(timer)

      // Retry on server errors (5xx) and rate limiting (429). Other 4xx and JSON-RPC application errors are valid responses.
      if (upstream.statusCode >= 500 || upstream.statusCode === 429) {
        lastError = `HTTP ${upstream.statusCode} from ${redactProvider(provider)}`
        logger.warn(`[${options.mode}] ${lastError}`)
        await upstream.body.dump()
        continue
      }

      const responseBody = Buffer.from(await upstream.body.arrayBuffer())
      res.writeHead(upstream.statusCode, buildDownstreamHeaders(upstream.headers, responseBody.byteLength))
      res.end(responseBody)
      return
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      const msg = isTimeout ? `timeout after ${options.timeout}ms` : err instanceof Error ? err.message : String(err)
      lastError = `${redactProvider(provider)}: ${msg}`
      logger.warn(`[${options.mode}] provider unreachable — ${lastError}`)
    }
  }

  logger.error(`[${options.mode}] all ${providers.length} provider(s) exhausted. Last: ${lastError}`)
  res.writeHead(503, { 'content-type': 'application/json' })

  const errorBody =
    options.mode === 'rpc'
      ? {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32603, message: 'All RPC providers are unavailable', data: lastError },
        }
      : {
          type: 'https://stellar.org/horizon-errors/service_unavailable',
          title: 'Service Unavailable',
          status: 503,
          detail: lastError,
        }

  res.end(JSON.stringify(errorBody))
}
