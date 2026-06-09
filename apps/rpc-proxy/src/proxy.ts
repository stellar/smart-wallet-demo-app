import http, { IncomingHttpHeaders } from 'http'

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

function buildDownstreamHeaders(upstream: Response): Record<string, string> {
  const headers: Record<string, string> = {}
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers[key] = value
    }
  })
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
      if (res.ok) return { ready: true, reachable: provider, failures }
      failures.push(`${provider}: HTTP ${res.status}`)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'AbortError' ? 'timeout' : err instanceof Error ? err.message : String(err)
      failures.push(`${provider}: ${msg}`)
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
        logger.warn(`[${options.mode}] provider[${i - 1}] failed → trying ${provider}`)
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), options.timeout)

      const upstream = await fetch(url, {
        method: req.method ?? 'GET',
        headers: upstreamHeaders,
        body: body.length > 0 ? body : undefined,
        signal: controller.signal,
      })

      clearTimeout(timer)

      // Retry on server errors (5xx) and rate limiting (429). Other 4xx and JSON-RPC application errors are valid responses.
      if (upstream.status >= 500 || upstream.status === 429) {
        lastError = `HTTP ${upstream.status} from ${provider}`
        logger.warn(`[${options.mode}] ${lastError}`)
        continue
      }

      const responseBody = await upstream.arrayBuffer()
      res.writeHead(upstream.status, buildDownstreamHeaders(upstream))
      res.end(Buffer.from(responseBody))
      return
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      const msg = isTimeout ? `timeout after ${options.timeout}ms` : err instanceof Error ? err.message : String(err)
      lastError = `${provider}: ${msg}`
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
