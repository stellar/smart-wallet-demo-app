import { AxiosError } from 'axios'

import Logger from 'src/app/core/services/logger'
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

  private static httpAxiosErrorHandler(error: AxiosError, context?: string): void {
    const message = 'Http Axios Error'
    Logger.error(message, error.code, error.name, error.message, error.request, error.response, error.config)

    ErrorHandling.catchError({
      message,
      error,
      context,
      severity: ErrorSeverity.ERROR,
    })
  }

  private static unexpectedErrorHandler(error: unknown, context?: string): void {
    const message = 'Unexpected Error'
    Logger.error(message, error, context)

    ErrorHandling.catchError({
      message,
      error: error as Error,
      context,
      severity: ErrorSeverity.ERROR,
    })
  }

  private static baseErrorHandler(error: BaseError): void {
    const message = 'Base Error'
    Logger.error(message, error)

    ErrorHandling.catchError({
      message,
      error,
      severity: ErrorSeverity.ERROR,
    })
  }

  static handleError({ error, context }: ErrorHandlingParams): void {
    if (error instanceof AxiosError) {
      return ErrorHandling.httpAxiosErrorHandler(error, context)
    }

    if (error instanceof BaseError) {
      return ErrorHandling.baseErrorHandler(error)
    }

    return ErrorHandling.unexpectedErrorHandler(error, context)
  }
}
