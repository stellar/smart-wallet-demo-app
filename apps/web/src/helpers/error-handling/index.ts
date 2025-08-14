import { WebAuthnError } from '@simplewebauthn/browser'
import { AxiosError, CanceledError } from 'axios'

import logger from 'src/app/core/services/logger'
import { Toast } from 'src/app/core/services/toast'

import BaseError, { ErrorSeverity } from './base-error'

interface ErrorHandlingParams {
  error: unknown
  context?: string
}

interface CatchErrorParams {
  severity: ErrorSeverity
  message: string
  error: Error
  context?: string
}

export class ErrorHandling {
  private static catchError({ severity, message }: CatchErrorParams): void {
    if (severity === ErrorSeverity.WARNING) {
      Toast.notify({ message, type: Toast.toastType.WARNING })
    } else {
      Toast.notify({ message, type: Toast.toastType.ERROR })
    }
  }

  private static httpAxiosCanceledErrorHandler(error: AxiosError<{ details?: string; message?: string }>): void {
    const message = error.response?.data.details || error.response?.data.message || 'Unknown Server Error'
    logger.error(message, { error })
  }

  private static httpAxiosErrorHandler(
    error: AxiosError<{ details?: string; message?: string }>,
    context?: string
  ): void {
    const message = error.response?.data.details || error.response?.data.message || 'Unknown Server Error'
    logger.error(message, { error })

    ErrorHandling.catchError({
      message,
      error,
      context,
      severity: ErrorSeverity.ERROR,
    })
  }

  private static unexpectedErrorHandler(error: unknown, context?: string): void {
    const message = 'Unexpected Error'
    logger.error(message, { error })

    ErrorHandling.catchError({
      message,
      error: error as Error,
      context,
      severity: ErrorSeverity.ERROR,
    })
  }

  private static baseErrorHandler(error: BaseError): void {
    const message = error.message
    logger.error(message, { error })

    ErrorHandling.catchError({
      message,
      error,
      severity: ErrorSeverity.ERROR,
    })
  }

  private static webauthnErrorHandler(error: WebAuthnError): void {
    const message = error.message
    logger.error(message, { error })

    ErrorHandling.catchError({
      message,
      error,
      severity: ErrorSeverity.ERROR,
    })
  }

  static handleError({ error, context }: ErrorHandlingParams): void {
    if (error instanceof CanceledError) {
      return ErrorHandling.httpAxiosCanceledErrorHandler(error)
    }

    if (error instanceof AxiosError) {
      return ErrorHandling.httpAxiosErrorHandler(error, context)
    }

    if (error instanceof BaseError) {
      return ErrorHandling.baseErrorHandler(error)
    }

    if (error instanceof WebAuthnError) {
      return ErrorHandling.webauthnErrorHandler(error)
    }

    return ErrorHandling.unexpectedErrorHandler(error, context)
  }
}
