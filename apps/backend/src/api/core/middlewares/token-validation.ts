import { NextFunction, Request, Response } from 'express'

import { messages } from 'api/embedded-wallets/constants/messages'
import { logger } from 'config/logger'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType } from 'interfaces/sdp-embedded-wallets/types'

export interface TokenValidationRequest extends Request {
  validatedInvitation?: {
    token: string
    email: string
    status: string
  }
}

export function tokenValidation(sdpEmbeddedWallets?: SDPEmbeddedWalletsType) {
  const sdpEmbeddedWalletsInstance = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()

  return async function (req: TokenValidationRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers['x-invitation-token'] as string

      if (!token) {
        throw new UnauthorizedException(messages.INVITATION_TOKEN_REQUIRED)
      }

      const sdpResponse = await sdpEmbeddedWalletsInstance.checkWalletStatus(token)

      req.validatedInvitation = {
        token,
        email: sdpResponse.receiver_contact,
        status: sdpResponse.status,
      }

      return next()
    } catch (error) {
      logger.error({ error }, 'Token validation failed')

      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }

      throw new UnauthorizedException(messages.INVALID_INVITATION_TOKEN)
    }
  }
}
