import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ErrorCode } from '../types'
import { BaseException } from './base'

export class ResourceNotFoundException extends BaseException {
  constructor(details: string) {
    super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatusCodes.NOT_FOUND, details)
  }
}
