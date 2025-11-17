import { ZodError } from 'zod/lib/ZodError'

import { HttpStatusCodes } from 'api/core/utils/http/status-code'

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
      // Handle union errors where path is empty
      if (error.path.length === 0) {
        // Add union errors to a special "_union" field for root-level errors
        fields['_union'] ??= []
        fields['_union'].push(error)
      } else {
        // Handle regular field errors
        for (const path of error.path) {
          fields[path] ??= []
          fields[path].push(error)
        }
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
    this.name = 'ZodValidationException'
    this.zodError = zodError
  }
}
