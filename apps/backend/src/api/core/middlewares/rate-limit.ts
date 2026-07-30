import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit'

import { TooManyRequestsException } from 'errors/exceptions/too-many-requests'

type RateLimiterConfig = {
  windowMs: number
  max: number
  details: string
}

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
