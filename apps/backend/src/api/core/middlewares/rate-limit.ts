import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

type RateLimiterConfig = {
  windowMs: number
  max: number
  details: string
}

/**
 * Relies on `trust proxy` being set to the exact hop count for the deployed environment
 * (see interfaces/express/index.ts — 2, for Cloudflare + Heroku's router). With that in
 * place, Express's default `req.ip` already resolves to the real client: it uses the
 * address the trusted hops appended, so a forged `X-Forwarded-For` from the client is
 * ignored rather than trusted. Deliberately NOT preferring any single header (e.g.
 * `cf-connecting-ip`) here — we can't verify the origin rejects traffic that didn't
 * come through that intermediary, so trusting an arbitrary client-sent header would
 * reopen the same bypass this is meant to close.
 *
 * Known limitation: uses express-rate-limit's default in-memory store, which is
 * per-process. If this app ever runs multiple Heroku web dynos, each dyno enforces its
 * own counter, so the effective limit scales with dyno count (and resets on every
 * dyno restart/deploy). Fixing this requires a shared store (e.g. Redis via
 * rate-limit-redis) — tracked as a follow-up, not done here since we don't currently
 * know the dyno count or whether Redis is provisioned for this app.
 */
export function rateLimiter(config: RateLimiterConfig): ReturnType<typeof rateLimit> {
  const options: Partial<RateLimitOptions> = {
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new TooManyRequestsException(config.details)),
  }

  return rateLimit(options)
}
