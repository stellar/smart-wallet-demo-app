import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ErrorCode } from '../types'
import { BaseException } from './base'

export class TooManyRequestsException extends BaseException {
  constructor(details: string) {
    super(ErrorCode.RATE_LIMITED, HttpStatusCodes.TOO_MANY_REQUESTS, details)
  }
}
