import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ErrorCode } from '../types'
import { BaseException } from './base'

export class BadRequestException extends BaseException {
  constructor(details: string) {
    super(ErrorCode.BAD_REQUEST, HttpStatusCodes.BAD_REQUEST, details)
  }
}
