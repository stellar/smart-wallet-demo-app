import { Request } from 'express'
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

type RateLimiterConfig = {
  windowMs: number
  max: number
  details: string
}

/**
 * Resolves the real client IP behind Cloudflare + an in-cluster ingress proxy.
 *
 * `req.ip`/Express's `trust proxy` hop-counting is fragile here: the app sits behind
 * two proxy hops (Cloudflare, then the ingress), and that count silently breaks if the
 * topology ever changes. `cf-connecting-ip` is set by Cloudflare itself at the edge
 * (it strips/overwrites any client-supplied value), so it's a more robust source of
 * truth than counting hops — as long as the origin only accepts traffic that actually
 * came through Cloudflare. Falls back to `req.ip` for direct/local access (e.g. dev).
 */
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
