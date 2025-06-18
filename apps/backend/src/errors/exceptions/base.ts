import { ERROR_MESSAGES } from '../messages'
import { ErrorCode } from '../types'

export class BaseException extends Error {
  public readonly message: string
  public readonly statusCode: number
  public readonly errorCode: number
  public readonly details: unknown

  constructor(error: ErrorCode, statusCode = 400, details?: unknown) {
    const errorMessage = ERROR_MESSAGES[error]
    super(errorMessage.message)
    this.message = errorMessage.message
    this.errorCode = errorMessage.code
    this.details = errorMessage.details
    this.statusCode = statusCode
    this.details = details
  }
}
