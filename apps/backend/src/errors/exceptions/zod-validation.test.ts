import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ZodError, ZodIssue } from 'zod'

import { ErrorCode } from '../types'
import { ZodValidationException } from './zod-validation'

describe('ZodValidationException', () => {
  it('should correctly set the name, errorCode, and statusCode', () => {
    const zodError = new ZodError([])
    const exception = new ZodValidationException(zodError)

    expect(exception.name).toBe('ZodValidationException')
    expect(exception.errorCode).toBe(ErrorCode.VALIDATION_ERROR)
    expect(exception.statusCode).toBe(HttpStatusCodes.BAD_REQUEST)
  })

  it('should correctly map ZodError issues to fields', () => {
    const zodIssues: ZodIssue[] = [
      { path: ['field1'], message: 'Invalid field1', code: 'invalid_type' } as ZodIssue,
      { path: ['field2'], message: 'Invalid field2', code: 'invalid_type' } as ZodIssue,
      { path: ['field1'], message: 'Another issue with field1', code: 'custom' },
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.fields).toEqual({
      field1: [
        { path: ['field1'], message: 'Invalid field1', code: 'invalid_type' },
        { path: ['field1'], message: 'Another issue with field1', code: 'custom' },
      ],
      field2: [{ path: ['field2'], message: 'Invalid field2', code: 'invalid_type' }],
    })
  })

  it('should correctly generate the payload', () => {
    const zodIssues: ZodIssue[] = [{ path: ['field1'], message: 'Invalid field1', code: 'invalid_type' } as ZodIssue]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.payload).toEqual({
      message: exception.message,
      code: ErrorCode.VALIDATION_ERROR,
      fields: {
        field1: [{ path: ['field1'], message: 'Invalid field1', code: 'invalid_type' }],
      },
    })
  })

  it('should handle empty ZodError gracefully', () => {
    const zodError = new ZodError([])
    const exception = new ZodValidationException(zodError)

    expect(exception.fields).toEqual({})
    expect(exception.payload.fields).toEqual({})
  })
})
