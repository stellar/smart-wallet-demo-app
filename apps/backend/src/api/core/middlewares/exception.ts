import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'

import { logger } from 'config/logger'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { BaseException } from 'errors/exceptions/base'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { ZodValidationException } from 'errors/exceptions/zod-validation'

function captureSentryException(
  err: Error,
  request: Request,
  level: Sentry.SeverityLevel,
  errorType: string,
  extraData?: Record<string, unknown>
): void {
  Sentry.withScope(scope => {
    scope.setTag('requestId', request.requestId)
    scope.setContext('request', {
      url: request.url,
      method: request.method,
      requestId: request.requestId,
      userAgent: request.get('User-Agent'),
    })
    scope.setLevel(level)
    scope.setTag('errorType', errorType)

    if (err instanceof BaseException) {
      scope.setExtra('statusCode', err.statusCode)
      scope.setExtra('details', err.details)
    }

    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    Sentry.captureException(err)
  })
}

export function exceptionMiddleware(err: Error, request: Request, response: Response, _next: NextFunction): Response {
  const requestContext = {
    url: request.url,
    method: request.method,
    requestId: request.requestId,
  }

  if (err instanceof ZodValidationException) {
    captureSentryException(err, request, 'warning', 'validation', { fields: err.fields })

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

  if (err instanceof ResourceNotFoundException) {
    captureSentryException(err, request, 'info', 'client_error')

    logger.info(
      {
        error: err.message,
        details: err.details,
        ...requestContext,
      },
      'Resource not found'
    )
    return response.status(err.statusCode).json({ message: err.message, details: err.details })
  }

  if (
    err instanceof BadRequestException ||
    err instanceof UnauthorizedException ||
    err instanceof ResourceConflictedException
  ) {
    captureSentryException(err, request, 'warning', 'client_error')

    logger.warn(
      {
        error: err.message,
        details: err.details,
        ...requestContext,
      },
      'Client error occurred'
    )
    return response.status(err.statusCode).json({ message: err.message, details: err.details })
  }

  if (err instanceof BaseException) {
    captureSentryException(err, request, 'error', 'application')

    logger.error(
      {
        error: err.message,
        details: err.details,
        ...requestContext,
      },
      'Application error occurred'
    )
    return response.status(err.statusCode).json({ message: err.message, details: err.details })
  }

  // Unexpected errors
  captureSentryException(err, request, 'fatal', 'unexpected')

  logger.error(
    {
      error: err.message,
      stack: err.stack,
      ...requestContext,
    },
    'Unexpected error occurred'
  )
  return response.status(500).json({ status: 'error', message: `An unexpected error has occurred` })
}
