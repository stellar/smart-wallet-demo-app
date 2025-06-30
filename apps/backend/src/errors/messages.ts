import { ErrorCode, ErrorMessage } from './types'

export const ERROR_MESSAGES: Record<number, ErrorMessage> = {
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'Unknown error',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'The payload has validation errors',
  },
  [ErrorCode.PERMISSION_ERROR]: {
    code: ErrorCode.PERMISSION_ERROR,
    message: "You don't have permission to do this action",
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: 'The requested resource was not found',
  },
  [ErrorCode.RESOURCE_CONFLICTED]: {
    code: ErrorCode.RESOURCE_CONFLICTED,
    message: 'The parameters conflicted with an existing resource',
  },
  [ErrorCode.BAD_REQUEST]: {
    code: ErrorCode.BAD_REQUEST,
    message: 'The request is not properly formed',
  },
}
