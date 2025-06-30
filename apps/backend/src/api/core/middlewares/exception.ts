import { BaseException } from 'errors/exceptions/base'
import { ZodValidationException } from 'errors/exceptions/zod-validation'
import { NextFunction, Request, Response } from 'express'

import { logger } from 'config/logger'

export function exceptionMiddleware(err: Error, _request: Request, response: Response, _next: NextFunction): Response {
  if (err instanceof ZodValidationException) {
    return response.status(err.statusCode).json(err.payload)
  }
  if (err instanceof BaseException) {
    return response.status(err.statusCode).json({ message: err.message, details: err.details })
  }
  logger.error(err)
  return response.status(500).json({ status: 'error', message: `An unexpected error has ocurred` })
}
