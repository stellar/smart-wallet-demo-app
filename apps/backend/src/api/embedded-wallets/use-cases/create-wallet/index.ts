import { Request, Response } from 'express'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'

const endpoint = '/'

export class CreateWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType

  constructor(userRepository?: UserRepositoryType, sdpEmbeddedWallets?: SDPEmbeddedWalletsType) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
  }

  parseResponseMessage(status: WalletStatus): string {
    switch (status) {
      case WalletStatus.SUCCESS:
        return 'Wallet created successfully'
      case WalletStatus.PROCESSING:
      case WalletStatus.PENDING:
        return 'Wallet creation is in process'
      case WalletStatus.FAILED:
        return 'Wallet creation failed'
      default:
        return 'Request processed, but status is unknown'
    }
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

    // Check if user exists
    const user = await this.userRepository.getUserByToken(requestBody.token)
    if (!user) {
      throw new ResourceNotFoundException(`User with token ${requestBody.token} not found`)
    }

    // Check if user already has a wallet
    if (user.publicKey) {
      throw new ResourceConflictedException(`User with token ${requestBody.token} already has a wallet`)
    }

    // Create wallet using SDP
    const newWallet = await this.sdpEmbeddedWallets.createWallet(requestBody)

    return {
      data: {
        status: newWallet.status,
      },
      message: this.parseResponseMessage(newWallet.status),
    }
  }
}

export { endpoint }
