import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ErrorCode } from '../types'
import { BaseException } from './base'

export class UnauthorizedException extends BaseException {
  constructor(details: string) {
    super(ErrorCode.PERMISSION_ERROR, HttpStatusCodes.UNAUTHORIZED, details)
  }
}
