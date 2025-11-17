import axios from 'axios'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { CheckWalletStatusResponse, SDPEmbeddedWalletsType } from 'interfaces/sdp-embedded-wallets/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/invitation-info/:token'

export class GetInvitationInfo extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType

  constructor(userRepository?: UserRepositoryType, sdpEmbeddedWallets?: SDPEmbeddedWalletsType) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { token: request.params?.token } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const token = validatedData.token
    let walletStatus: CheckWalletStatusResponse

    // Fetch updated status from SDP
    try {
      walletStatus = await this.sdpEmbeddedWallets.checkWalletStatus(token)
    } catch (error) {
      if (axios.isAxiosError(error) && error.status === HttpStatusCodes.UNAUTHORIZED) {
        throw new UnauthorizedException(messages.NOT_AUTHORIZED)
      }
      throw error
    }

    // If the user doesn't exist, create it
    const user = await this.userRepository.getUserByToken(token)
    if (!user) {
      await this.userRepository.createUser(
        {
          uniqueToken: token,
          email: walletStatus.receiver_contact,
        },
        true
      )
    }

    return {
      data: {
        status: walletStatus.status,
        email: walletStatus.receiver_contact,
      },
      message: 'Retrieved invitation info successfully',
    }
  }
}

export { endpoint }
