import http from 'http'

import express, { NextFunction, Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

import { rateLimiter } from './rate-limit'

function buildMockReq(ip: string, headers: Record<string, string> = {}): Request {
  return {
    ip,
    headers,
    socket: { remoteAddress: ip },
    app: { get: () => false },
  } as unknown as Request
}

function buildMockRes(): Response {
  return {
    headersSent: false,
    writableEnded: false,
    statusCode: 200,
    setHeader: vi.fn(),
    append: vi.fn(),
    on: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as Response
}

describe('rateLimiter middleware', () => {
  let mockNext: NextFunction

  beforeEach(() => {
    mockNext = vi.fn()
  })

  it('allows requests under the configured limit', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 2, details: 'too many' })
    const req = buildMockReq('10.0.0.1')

    await middleware(req, buildMockRes(), mockNext)
    await middleware(req, buildMockRes(), mockNext)

    expect(mockNext).toHaveBeenCalledTimes(2)
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(TooManyRequestsException))
  })

  it('blocks requests once the limit is exceeded, with the configured message', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 2, details: 'too many recovery attempts' })
    const req = buildMockReq('10.0.0.2')

    await middleware(req, buildMockRes(), mockNext)
    await middleware(req, buildMockRes(), mockNext)
    await middleware(req, buildMockRes(), mockNext)

    const lastCallArg = (mockNext as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]
    expect(lastCallArg).toBeInstanceOf(TooManyRequestsException)
    expect(lastCallArg.details).toBe('too many recovery attempts')
  })

  it('tracks limits independently per IP', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 1, details: 'too many' })

    await middleware(buildMockReq('10.0.0.3'), buildMockRes(), mockNext)
    await middleware(buildMockReq('10.0.0.4'), buildMockRes(), mockNext)

    expect(mockNext).toHaveBeenCalledTimes(2)
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(TooManyRequestsException))
  })
})

describe('rateLimiter behind a proxy (integration, real Express app)', () => {
  // Reproduces the scenario from the bounty reporter's PoC: with `trust proxy` set to
  // the real hop count for this deployment (2 — Cloudflare, confirmed in front of the
  // public domain, then Heroku's router; see interfaces/express/index.ts), a
  // client-forged X-Forwarded-For must NOT let each request appear as a distinct IP,
  // and the real client behind those two hops must still be resolved correctly.
  function startApp(trustProxy: number | boolean | undefined): Promise<{ server: http.Server; port: number }> {
    return new Promise(resolve => {
      const app = express()
      if (trustProxy !== undefined) app.set('trust proxy', trustProxy)
      app.post('/recover', rateLimiter({ windowMs: 60_000, max: 5, details: 'too many' }), (req, res) =>
        res.json({ seenIp: req.ip })
      )
      const server = app.listen(0, () => {
        const address = server.address()
        const port = typeof address === 'object' && address ? address.port : 0
        resolve({ server, port })
      })
    })
  }

  function post(port: number, forwardedFor: string): Promise<{ status: number; seenIp?: string }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        { host: '127.0.0.1', port, path: '/recover', method: 'POST', headers: { 'X-Forwarded-For': forwardedFor } },
        res => {
          let body = ''
          res.on('data', chunk => (body += chunk))
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode ?? 0, seenIp: JSON.parse(body || '{}').seenIp })
            } catch {
              resolve({ status: res.statusCode ?? 0 })
            }
          })
        }
      )
      req.on('error', reject)
      req.end()
    })
  }

  let server: http.Server | undefined

  afterEach(() => {
    server?.close()
  })

  it('ignores a forged X-Forwarded-For and enforces the limit per real client, with trust proxy correctly set', async () => {
    const started = await startApp(2) // Cloudflare + Heroku's router: two trusted hops
    server = started.server

    const results = []
    for (let i = 0; i < 10; i++) {
      // Each request claims a different attacker-chosen prefix. The next entry is the
      // real client (must be the one resolved), and the last is the address Cloudflare
      // itself would append when forwarding to Heroku's router.
      results.push(await post(started.port, `10.0.0.${i}, 203.0.113.7, 104.18.7.25`))
    }

    const okCount = results.filter(r => r.status === 200).length
    const blockedCount = results.filter(r => r.status === 429).length
    const distinctIpsSeen = new Set(results.map(r => r.seenIp).filter(Boolean))

    expect(okCount).toBe(5)
    expect(blockedCount).toBe(5)
    expect(distinctIpsSeen).toEqual(new Set(['203.0.113.7']))
  })

  it('does not collapse distinct real clients onto the Cloudflare edge address when only one hop is trusted (regression guard for under-counting hops)', async () => {
    const started = await startApp(1) // wrong: misses the Cloudflare hop
    server = started.server

    const results = []
    for (let i = 0; i < 10; i++) {
      results.push(await post(started.port, `10.0.0.${i}, 203.0.113.${i}, 104.18.7.25`))
    }

    const distinctIpsSeen = new Set(results.map(r => r.seenIp).filter(Boolean))
    // With trust proxy under-counted, every distinct real client (203.0.113.0..9)
    // resolves to the same Cloudflare edge address instead — exactly the milder bug
    // the reporter caught in the previous round (trust proxy: 1 instead of 2).
    expect(distinctIpsSeen).toEqual(new Set(['104.18.7.25']))
  })

  // Expect noisy stderr here: express-rate-limit's own validation logs
  // ERR_ERL_UNEXPECTED_X_FORWARDED_FOR for this exact misconfiguration — that's the
  // point of the test, not a bug in it.
  it('does NOT enforce a meaningful per-client limit when trust proxy is left unset (regression guard)', async () => {
    const started = await startApp(undefined)
    server = started.server

    const results = []
    for (let i = 0; i < 10; i++) {
      results.push(await post(started.port, `10.0.0.${i}, 203.0.113.7`))
    }

    const distinctIpsSeen = new Set(results.map(r => r.seenIp).filter(Boolean))
    // Documents the failure mode this app must avoid: every request resolves to the
    // same (proxy) address regardless of the forwarded chain, so all clients would
    // share one bucket. This test exists to make sure `trust proxy` is never removed
    // from interfaces/express/index.ts without this being noticed.
    expect(distinctIpsSeen.size).toBe(1)
  })
})
