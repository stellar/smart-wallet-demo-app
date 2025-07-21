import { NextFunction, Request, Response } from 'express'

import { logger } from 'config/logger'
import { BaseException } from 'errors/exceptions/base'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

export function exceptionMiddleware(err: Error, request: Request, response: Response, _next: NextFunction): Response {
  if (err instanceof ZodValidationException) {
    logger.warn(
      {
        error: err.message,
        fields: err.fields,
        url: request.url,
        method: request.method,
        requestId: request.requestId,
      },
      'Validation error occurred'
    )
    return response.status(err.statusCode).json(err.payload)
  }
  if (err instanceof BaseException) {
    logger.error(
      {
        error: err.message,
        details: err.details,
        url: request.url,
        method: request.method,
        requestId: request.requestId,
      },
      'Base exception occurred'
    )
    return response.status(err.statusCode).json({ message: err.message, details: err.details })
  }
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      url: request.url,
      method: request.method,
      requestId: request.requestId,
    },
    'Unexpected error occurred'
  )
  return response.status(500).json({ status: 'error', message: `An unexpected error has ocurred` })
}
