import 'express'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      userData?: {
        userId: string
        email: string
      }
      validatedInvitation?: {
        token: string
        email: string
        status: WalletStatus
      }
    }
    interface Locals {
      responseData?: unknown
      logMetadata?: Set<unknown>
    }
  }
}
