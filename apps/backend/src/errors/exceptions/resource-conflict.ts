import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ErrorCode } from '../types'
import { BaseException } from './base'

export class ResourceConflictedException extends BaseException {
  constructor(details: string) {
    super(ErrorCode.RESOURCE_CONFLICTED, HttpStatusCodes.CONFLICT, details)
  }
}
