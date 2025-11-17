import axios from 'axios'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType } from 'interfaces/sdp-embedded-wallets/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/resend-invite'

export class ResendInvite extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType

  constructor(userRepository?: UserRepositoryType, sdpEmbeddedWallets?: SDPEmbeddedWalletsType) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const requestBody = {
      ...validatedData,
    }

    // Check if user already has a wallet
    const user = await this.userRepository.getUserByEmail(requestBody.email)
    if (user?.contractAddress) {
      // Fake response to protect against attackers
      return {
        data: {
          email_sent: true,
        },
        message: 'Invite resent successfully',
      }
    }

    // Resend invite using SDP
    try {
      await this.sdpEmbeddedWallets.resendInvite(validatedData.email)
    } catch (error) {
      if (axios.isAxiosError(error) && error.status === HttpStatusCodes.BAD_REQUEST) {
        // Fake response to protect against attackers
        return {
          data: {
            email_sent: true,
          },
          message: 'Invite resent successfully',
        }
      }
      throw error
    }

    return {
      data: {
        email_sent: true,
      },
      message: 'Invite resent successfully',
    }
  }
}

export { endpoint }
