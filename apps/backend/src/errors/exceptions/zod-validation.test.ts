import { ZodError, ZodIssue } from 'zod'

import { HttpStatusCodes } from 'api/core/utils/http/status-code'

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
      {
        path: ['field1'],
        message: 'Invalid field1',
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
      } as ZodIssue,
      {
        path: ['field2'],
        message: 'Invalid field2',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
      {
        path: ['field1'],
        message: 'Another issue with field1',
        code: 'custom',
      } as ZodIssue,
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.fields).toEqual({
      field1: [
        {
          path: ['field1'],
          message: 'Invalid field1',
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
        },
        {
          path: ['field1'],
          message: 'Another issue with field1',
          code: 'custom',
        },
      ],
      field2: [
        {
          path: ['field2'],
          message: 'Invalid field2',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ],
    })
  })

  it('should correctly generate the payload', () => {
    const zodIssues: ZodIssue[] = [
      {
        path: ['field1'],
        message: 'Invalid field1',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.payload).toEqual({
      message: exception.message,
      code: ErrorCode.VALIDATION_ERROR,
      fields: {
        field1: [
          {
            path: ['field1'],
            message: 'Invalid field1',
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
          },
        ],
      },
    })
  })

  it('should handle empty ZodError gracefully', () => {
    const zodError = new ZodError([])
    const exception = new ZodValidationException(zodError)

    expect(exception.fields).toEqual({})
    expect(exception.payload.fields).toEqual({})
  })

  it('should handle union errors with empty paths', () => {
    // Create nested ZodErrors for union errors
    const unionError1 = new ZodError([
      {
        path: [],
        message: 'Expected object, received string',
        code: 'invalid_type',
        expected: 'object',
        received: 'string',
      } as ZodIssue,
    ])

    const unionError2 = new ZodError([
      {
        path: [],
        message: 'Expected object, received number',
        code: 'invalid_type',
        expected: 'object',
        received: 'number',
      } as ZodIssue,
    ])

    const zodIssues: ZodIssue[] = [
      {
        path: [],
        message: 'Invalid input',
        code: 'invalid_union',
        unionErrors: [unionError1, unionError2],
      } as ZodIssue,
      {
        path: ['field1'],
        message: 'Invalid field1',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.fields).toEqual({
      _union: [
        {
          path: [],
          message: 'Invalid input',
          code: 'invalid_union',
          unionErrors: [unionError1, unionError2],
        },
      ],
      field1: [
        {
          path: ['field1'],
          message: 'Invalid field1',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ],
    })
  })

  it('should produce the exact format requested', () => {
    const zodIssues: ZodIssue[] = [
      {
        path: ['email'],
        message: 'Required',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
      {
        path: ['registration_response_json'],
        message: 'Required',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.payload.fields).toEqual({
      email: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['email'],
          message: 'Required',
        },
      ],
      registration_response_json: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['registration_response_json'],
          message: 'Required',
        },
      ],
    })
  })

  it('should produce union errors in the same format', () => {
    // Create nested ZodErrors for union errors
    const unionError1 = new ZodError([
      {
        path: [],
        message: 'Expected object, received string',
        code: 'invalid_type',
        expected: 'object',
        received: 'string',
      } as ZodIssue,
    ])

    const unionError2 = new ZodError([
      {
        path: [],
        message: 'Expected object, received number',
        code: 'invalid_type',
        expected: 'object',
        received: 'number',
      } as ZodIssue,
    ])

    const zodIssues: ZodIssue[] = [
      {
        path: [],
        message: 'Invalid input',
        code: 'invalid_union',
        unionErrors: [unionError1, unionError2],
      } as ZodIssue,
    ]
    const zodError = new ZodError(zodIssues)
    const exception = new ZodValidationException(zodError)

    expect(exception.payload.fields).toEqual({
      _union: [
        {
          code: 'invalid_union',
          message: 'Invalid input',
          path: [],
          unionErrors: [unionError1, unionError2],
        },
      ],
    })
  })
})
