export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

// we can have different error types
// like Integration Error, Business Logic Error, Validation Error, etc.
// we can use this entity as a base for all these errors
export default class BaseError extends Error {
  constructor(
    message: string,
    public severity: ErrorSeverity = ErrorSeverity.ERROR,
    public originalMessage?: string
  ) {
    super(message)
  }
}
