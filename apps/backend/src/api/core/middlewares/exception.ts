import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'

import { logger } from 'config/logger'
import { BaseException } from 'errors/exceptions/base'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

export function exceptionMiddleware(err: Error, request: Request, response: Response, _next: NextFunction): Response {
  const requestContext = {
    url: request.url,
    method: request.method,
    requestId: request.requestId,
  }

  Sentry.withScope(scope => {
    scope.setTag('requestId', request.requestId)
    scope.setContext('request', {
      ...requestContext,
      userAgent: request.get('User-Agent'),
    })

    if (err instanceof ZodValidationException) {
      scope.setLevel('warning')
      scope.setTag('errorType', 'validation')
      scope.setExtra('fields', err.fields)
      scope.setExtra('statusCode', err.statusCode)
      Sentry.captureException(err)

      logger.warn(
        {
          error: err.message,
          fields: err.fields,
          ...requestContext,
        },
        'Validation error occurred'
      )
      return response.status(err.statusCode).json(err.payload)
    }

    if (err instanceof BaseException) {
      scope.setLevel('error')
      scope.setTag('errorType', 'business')
      scope.setExtra('details', err.details)
      scope.setExtra('statusCode', err.statusCode)
      Sentry.captureException(err)

      logger.error(
        {
          error: err.message,
          details: err.details,
          ...requestContext,
        },
        'Base exception occurred'
      )
      return response.status(err.statusCode).json({ message: err.message, details: err.details })
    }

    // Unexpected errors
    scope.setLevel('fatal')
    scope.setTag('errorType', 'unexpected')
    Sentry.captureException(err)
  })

  logger.error(
    {
      error: err.message,
      stack: err.stack,
      ...requestContext,
    },
    'Unexpected error occurred'
  )
  return response.status(500).json({ status: 'error', message: `An unexpected error has ocurred` })
}
