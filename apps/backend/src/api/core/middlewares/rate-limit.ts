import { Request } from 'express'
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

type RateLimiterConfig = {
  windowMs: number
  max: number
  details: string
}

 * two proxy hops (Cloudflare, then the ingress), and that count silently breaks if the
function resolveClientIp(request: Request): string {
  const cfConnectingIp = request.headers['cf-connecting-ip']
  if (typeof cfConnectingIp === 'string' && cfConnectingIp.length > 0) {
    return cfConnectingIp
  }

  return request.ip ?? request.socket.remoteAddress ?? 'unknown'
}

export function rateLimiter(config: RateLimiterConfig): ReturnType<typeof rateLimit> {
  const options: Partial<RateLimitOptions> = {
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: resolveClientIp,
    handler: (_req, _res, next) => next(new TooManyRequestsException(config.details)),
  }

  return rateLimit(options)
}
