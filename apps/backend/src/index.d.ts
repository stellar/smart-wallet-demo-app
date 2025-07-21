import 'express'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      userId?: string
    }
    interface Locals {
      responseData?: unknown
      logMetadata?: Set<unknown>
    }
  }
}
