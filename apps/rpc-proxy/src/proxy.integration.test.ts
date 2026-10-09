import http from 'http'
import { AddressInfo } from 'net'
import zlib from 'zlib'

import { proxyWithFallback } from './proxy'

vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

const RPC_RESULT = JSON.stringify({ jsonrpc: '2.0', id: 1, result: { status: 'healthy' } })

interface RawResponse {
  statusCode: number
  headers: http.IncomingHttpHeaders
  body: Buffer
}

function listen(server: http.Server): Promise<number> {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port))
  })
}

function close(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => server.close(err => (err ? reject(err) : resolve())))
}

// Raw client: no automatic decompression, mirroring how the Go net/http
// transport surfaces the bytes to the gzip reader in wallet-backend.
function rawPost(port: number, body: string, headers: Record<string, string>): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method: 'POST', path: '/', headers }, res => {
      const chunks: Buffer[] = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () =>
        resolve({ statusCode: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) })
      )
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end(body)
  })
}

describe('proxy pass-through (real servers)', () => {
  let upstream: http.Server
  let proxy: http.Server
  let upstreamPort: number
  let proxyPort: number

  beforeAll(async () => {
    // Upstream RPC provider: gzips the response only when the client asks for it.
    upstream = http.createServer((req, res) => {
      const acceptsGzip = (req.headers['accept-encoding'] ?? '').includes('gzip')
      if (acceptsGzip) {
        const compressed = zlib.gzipSync(RPC_RESULT)
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-encoding': 'gzip',
          'content-length': String(compressed.byteLength),
        })
        res.end(compressed)
      } else {
        res.writeHead(200, {
          'content-type': 'application/json',
          'content-length': String(Buffer.byteLength(RPC_RESULT)),
        })
        res.end(RPC_RESULT)
      }
    })
    upstreamPort = await listen(upstream)

    proxy = http.createServer((req, res) => {
      void proxyWithFallback([`http://127.0.0.1:${upstreamPort}`], req, res, { timeout: 5000, mode: 'rpc' })
    })
    proxyPort = await listen(proxy)
  })

  afterAll(async () => {
    await close(proxy)
    await close(upstream)
  })

  it('forwards gzip responses byte-for-byte with a truthful content-encoding header', async () => {
    const res = await rawPost(proxyPort, JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }), {
      'content-type': 'application/json',
      'accept-encoding': 'gzip',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-encoding']).toBe('gzip')
    expect(res.headers['content-length']).toBe(String(res.body.byteLength))
    // The body must actually be gzip — this is the wallet-backend regression:
    // "unmarshaling RPC response: gzip: invalid header"
    expect(zlib.gunzipSync(res.body).toString()).toBe(RPC_RESULT)
  })

  it('forwards plain responses untouched when the client does not accept gzip', async () => {
    const res = await rawPost(proxyPort, JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }), {
      'content-type': 'application/json',
      'accept-encoding': 'identity',
    })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-encoding']).toBeUndefined()
    expect(res.body.toString()).toBe(RPC_RESULT)
  })
})
