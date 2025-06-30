import 'express'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
    }
    interface Locals {
      responseData?: unknown
      logMetadata?: Set<unknown>
    }
  }
}
