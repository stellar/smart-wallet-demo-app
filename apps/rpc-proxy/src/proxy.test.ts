import http from 'http'
import { PassThrough } from 'stream'

import { request } from 'undici'

import { checkRpcReadiness, proxyWithFallback } from './proxy'

vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))
vi.mock('undici', () => ({ request: vi.fn() }))

vi.stubGlobal('fetch', vi.fn())
const mockFetch = vi.mocked(fetch)
const mockRequest = vi.mocked(request)

function makeReq(
  opts: { method?: string; url?: string; body?: string; headers?: Record<string, string> } = {}
): http.IncomingMessage {
  const stream = new PassThrough()
  Object.assign(stream, {
    method: opts.method ?? 'POST',
    url: opts.url ?? '/',
    headers: opts.headers ?? {},
  })
  process.nextTick(() => {
    if (opts.body) stream.push(Buffer.from(opts.body))
    stream.push(null)
  })
  return stream as unknown as http.IncomingMessage
}

function makeRes() {
  let statusCode = 0
  let responseBody = ''
  let responseHeaders: Record<string, string | string[]> = {}
  return {
    get statusCode() {
      return statusCode
    },
    get responseBody() {
      return responseBody
    },
    get responseHeaders() {
      return responseHeaders
    },
    headersSent: false,
    writeHead: vi.fn((status: number, headers?: Record<string, string | string[]>) => {
      statusCode = status
      responseHeaders = headers ?? {}
    }),
    end: vi.fn((data?: string | Buffer) => {
      responseBody = data?.toString() ?? ''
    }),
  }
}

function mockUpstreamResponse(statusCode: number, body = '{"ok":true}', headers: Record<string, string> = {}) {
  const bytes = new TextEncoder().encode(body)
  return {
    statusCode,
    headers,
    body: {
      arrayBuffer: () => Promise.resolve(bytes.buffer as ArrayBuffer),
      dump: () => Promise.resolve(),
    },
  } as unknown as Awaited<ReturnType<typeof request>>
}

type MockRes = ReturnType<typeof makeRes>

function asServerResponse(res: MockRes): http.ServerResponse {
  return res as unknown as http.ServerResponse
}

describe('proxyWithFallback', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('returns first provider response on success', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(res.statusCode).toBe(200)
  })

  it('falls back to next provider on 500', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(500)).mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(res.statusCode).toBe(200)
  })

  it('falls back on 429 rate limit', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(429)).mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(res.statusCode).toBe(200)
  })

  it('falls back on network error', async () => {
    mockRequest.mockRejectedValueOnce(new Error('ECONNREFUSED')).mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(res.statusCode).toBe(200)
  })

  it('falls back on timeout (AbortError)', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    mockRequest.mockRejectedValueOnce(abortError).mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(2)
    expect(res.statusCode).toBe(200)
  })

  it('does not retry on 400 — returns it directly to client', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(400, '{"error":"bad input"}'))
    const res = makeRes()
    await proxyWithFallback(['https://a.com', 'https://b.com'], makeReq(), asServerResponse(res), {
      timeout: 60000,
      mode: 'rpc',
    })
    expect(mockRequest).toHaveBeenCalledTimes(1)
    expect(res.statusCode).toBe(400)
  })

  it('returns 503 with JSON-RPC shape when all RPC providers fail', async () => {
    mockRequest.mockResolvedValue(mockUpstreamResponse(500))
    const res = makeRes()
    await proxyWithFallback(['https://a.com'], makeReq(), asServerResponse(res), { timeout: 60000, mode: 'rpc' })
    expect(res.statusCode).toBe(503)
    const body = JSON.parse(res.responseBody)
    expect(body.jsonrpc).toBe('2.0')
    expect(body.error.code).toBe(-32603)
  })

  it('returns 503 with Horizon HAL shape when all Horizon providers fail', async () => {
    mockRequest.mockResolvedValue(mockUpstreamResponse(500))
    const res = makeRes()
    await proxyWithFallback(
      ['https://horizon.stellar.org'],
      makeReq({ method: 'GET', url: '/accounts/GABC' }),
      asServerResponse(res),
      { timeout: 60000, mode: 'horizon' }
    )
    expect(res.statusCode).toBe(503)
    const body = JSON.parse(res.responseBody)
    expect(body.type).toContain('service_unavailable')
    expect(body.status).toBe(503)
  })

  it('appends request path to provider URL in horizon mode', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    await proxyWithFallback(
      ['https://horizon.stellar.org'],
      makeReq({ method: 'GET', url: '/accounts/GABC?limit=10' }),
      asServerResponse(res),
      { timeout: 60000, mode: 'horizon' }
    )
    expect(mockRequest).toHaveBeenCalledWith('https://horizon.stellar.org/accounts/GABC?limit=10', expect.any(Object))
  })

  it('does not forward hop-by-hop headers upstream', async () => {
    mockRequest.mockResolvedValueOnce(mockUpstreamResponse(200))
    const res = makeRes()
    const req = makeReq({ headers: { connection: 'keep-alive', host: 'localhost', authorization: 'Bearer token' } })
    await proxyWithFallback(['https://a.com'], req, asServerResponse(res), { timeout: 60000, mode: 'rpc' })
    const initArgs = mockRequest.mock.calls[0][1] as { headers: Record<string, string> }
    const sentHeaders = initArgs.headers
    expect(sentHeaders['connection']).toBeUndefined()
    expect(sentHeaders['host']).toBeUndefined()
    expect(sentHeaders['authorization']).toBe('Bearer token')
  })

  it('preserves content-encoding and restates content-length from the untouched body', async () => {
    const compressedLookingBody = '\x1f\x8b-compressed-bytes'
    mockRequest.mockResolvedValueOnce(
      mockUpstreamResponse(200, compressedLookingBody, {
        'content-encoding': 'gzip',
        'content-type': 'application/json',
        'content-length': '9999',
        'transfer-encoding': 'chunked',
      })
    )
    const res = makeRes()
    await proxyWithFallback(['https://a.com'], makeReq(), asServerResponse(res), { timeout: 60000, mode: 'rpc' })
    expect(res.statusCode).toBe(200)
    expect(res.responseBody).toBe(compressedLookingBody)
    expect(res.responseHeaders['content-encoding']).toBe('gzip')
    expect(res.responseHeaders['content-type']).toBe('application/json')
    expect(res.responseHeaders['content-length']).toBe(String(Buffer.byteLength(compressedLookingBody)))
    expect(res.responseHeaders['transfer-encoding']).toBeUndefined()
  })
})

describe('checkRpcReadiness', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('returns ready when first provider responds 200', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 } as Response)
    const result = await checkRpcReadiness(['https://a.com', 'https://b.com'], 1000)
    expect(result.ready).toBe(true)
    expect(result.reachable).toBe('https://a.com')
    expect(result.failures).toHaveLength(0)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('tries next provider when first fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)
    const result = await checkRpcReadiness(['https://a.com', 'https://b.com'], 1000)
    expect(result.ready).toBe(true)
    expect(result.reachable).toBe('https://b.com')
    expect(result.failures).toHaveLength(1)
  })

  it('returns not ready when all providers fail', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 } as Response)
    const result = await checkRpcReadiness(['https://a.com', 'https://b.com'], 1000)
    expect(result.ready).toBe(false)
    expect(result.reachable).toBeNull()
    expect(result.failures).toHaveLength(2)
  })

  it('records timeout as failure and continues to next provider', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' })
    mockFetch.mockRejectedValueOnce(abortError).mockResolvedValueOnce({ ok: true, status: 200 } as Response)
    const result = await checkRpcReadiness(['https://a.com', 'https://b.com'], 1000)
    expect(result.ready).toBe(true)
    expect(result.failures[0]).toContain('timeout')
  })
})
