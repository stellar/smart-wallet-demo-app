import 'express'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      userData?: {
        userId: string
        email: string
      }
    }
    interface Locals {
      responseData?: unknown
      logMetadata?: Set<unknown>
    }
  }
}
