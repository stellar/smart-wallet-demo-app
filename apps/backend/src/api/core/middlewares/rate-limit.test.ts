import { NextFunction, Request, Response } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

import { rateLimiter } from './rate-limit'

function buildMockReq(ip: string): Request {
  return {
    ip,
    headers: {},
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
