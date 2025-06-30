import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ZodError } from 'zod/lib/ZodError'

import { ErrorCode } from '../types'
import { BaseException } from './base'

type ZodValidationPayload = {
  message: string
  code: number
  fields?: Record<string, unknown>
}
type FieldError = {
  code: string
  message: string
}
type FieldsErrors = Record<string, FieldError[]>

export class ZodValidationException extends BaseException {
  readonly zodError: ZodError

  get fields(): FieldsErrors {
    return this.zodError.errors.reduce((fields, error) => {
      for (const path of error.path) {
        fields[path] ??= []
        fields[path].push(error)
      }
      return fields
    }, {} as FieldsErrors)
  }

  get payload(): ZodValidationPayload {
    return {
      message: this.message,
      code: this.errorCode,
      fields: this.fields,
    }
  }

  constructor(zodError: ZodError) {
    super(ErrorCode.VALIDATION_ERROR, HttpStatusCodes.BAD_REQUEST)
    this.name = 'ZopValidationException'
    this.zodError = zodError
  }
}
