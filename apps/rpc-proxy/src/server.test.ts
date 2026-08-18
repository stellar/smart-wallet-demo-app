import http from 'http'
import { AddressInfo } from 'net'

import { createServer, ServerOptions } from './server'

vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

vi.stubGlobal('fetch', vi.fn())
const mockFetch = vi.mocked(fetch)

const TEST_OPTIONS: ServerOptions = { network: 'testnet', timeout: 5000, readinessTimeout: 1000 }

// createServer() already calls server.listen(port, ...) internally — just wait for it.
function waitForListening(server: http.Server): Promise<number> {
  return new Promise(resolve => {
    server.once('listening', () => resolve((server.address() as AddressInfo).port))
  })
}

function close(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => server.close(err => (err ? reject(err) : resolve())))
}

interface RawResponse {
  statusCode: number
  headers: http.IncomingHttpHeaders
  body: string
}

function call(
  port: number,
  method: string,
  path: string,
  body?: Buffer,
  headers?: Record<string, string>
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path, headers }, res => {
      const chunks: Buffer[] = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () =>
        resolve({ statusCode: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks).toString() })
      )
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end(body)
  })
}

describe('createServer (real HTTP server)', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('sets permissive CORS headers on every response', async () => {
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'GET', '/health')
      expect(res.headers['access-control-allow-origin']).toBe('*')
      expect(res.headers['access-control-allow-methods']).toBe('GET, POST, OPTIONS')
      expect(res.headers['access-control-allow-headers']).toBe('content-type, authorization')
    } finally {
      await close(server)
    }
  })

  it('echoes the requested preflight headers instead of a wildcard', async () => {
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'OPTIONS', '/', undefined, {
        'access-control-request-headers': 'x-custom-header, content-type',
      })
      expect(res.headers['access-control-allow-headers']).toBe('x-custom-header, content-type')
    } finally {
      await close(server)
    }
  })

  it('answers a CORS preflight OPTIONS request with 204 and no body', async () => {
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'OPTIONS', '/anything')
      expect(res.statusCode).toBe(204)
      expect(res.body).toBe('')
    } finally {
      await close(server)
    }
  })

  it('redacts credentials embedded in provider URLs on GET /health', async () => {
    const server = createServer(['https://stellar.liquify.com/api=SECRET_123/testnet'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'GET', '/health')
      const body = JSON.parse(res.body)
      expect(res.statusCode).toBe(200)
      expect(body).toEqual({
        status: 'ok',
        mode: 'rpc',
        network: expect.any(String),
        providers: ['stellar.liquify.com'],
      })
      expect(res.body).not.toContain('SECRET_123')
    } finally {
      await close(server)
    }
  })

  it('GET /health/ready (rpc mode) returns 200 when a provider is healthy', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 } as Response)
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'GET', '/health/ready')
      const body = JSON.parse(res.body)
      expect(res.statusCode).toBe(200)
      expect(body.ready).toBe(true)
      expect(body.reachable).toBe('a.com')
    } finally {
      await close(server)
    }
  })

  it('GET /health/ready (rpc mode) returns 503 when every provider is unhealthy', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 } as Response)
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'GET', '/health/ready')
      const body = JSON.parse(res.body)
      expect(res.statusCode).toBe(503)
      expect(body.ready).toBe(false)
    } finally {
      await close(server)
    }
  })

  it('GET /health/ready (horizon mode) always returns 200 without probing providers', async () => {
    const server = createServer(['https://horizon.stellar.org'], 'horizon', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const res = await call(port, 'GET', '/health/ready')
      const body = JSON.parse(res.body)
      expect(res.statusCode).toBe(200)
      expect(body).toEqual({ ready: true, mode: 'horizon' })
      expect(mockFetch).not.toHaveBeenCalled()
    } finally {
      await close(server)
    }
  })

  it('returns 413 when the request body exceeds the size cap', async () => {
    const server = createServer(['https://a.com'], 'rpc', 0, TEST_OPTIONS)
    const port = await waitForListening(server)
    try {
      const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 'a')
      const res = await call(port, 'POST', '/', oversized)
      expect(res.statusCode).toBe(413)
    } finally {
      await close(server)
    }
  }, 15000)
})
