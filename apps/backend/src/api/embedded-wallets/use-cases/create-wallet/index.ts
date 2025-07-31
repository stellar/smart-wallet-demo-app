import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnRegistration from 'api/core/helpers/webauthn/registration'
import { IWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/types'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/register/complete'

export class CreateWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private webauthnRegistrationHelper: IWebAuthnRegistration
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType

  constructor(
    userRepository?: UserRepositoryType,
    webauthnRegistrationHelper?: IWebAuthnRegistration,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnRegistrationHelper = webauthnRegistrationHelper || WebAuthnRegistration.getInstance()
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
    const user = await this.userRepository.getUserByEmail(requestBody.email, { relations: ['passkeys'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    // Check if user already has a wallet
    if (user.contractAddress) {
      throw new ResourceConflictedException(messages.USER_ALREADY_HAS_WALLET)
    }

    // Check auth challenge resolution
    const challengeResult = await this.webauthnRegistrationHelper.complete({
      user,
      registrationResponseJSON: requestBody.registration_response_json,
    })

    if (!challengeResult) throw new UnauthorizedException(messages.UNABLE_TO_COMPLETE_PASSKEY_REGISTRATION)

    const { passkey } = challengeResult

    // Create wallet using SDP
    const newWallet = await this.sdpEmbeddedWallets.createWallet({
      token: user.uniqueToken,
      credential_id: passkey.credentialId,
      public_key: passkey.credentialHexPublicKey,
    })

    // Generate JWT token
    const authToken = generateToken(user.userId, user.email)

    return {
      data: {
        status: newWallet.status,
        token: authToken,
      },
      message: this.parseResponseMessage(newWallet.status),
    }
  }
}

export { endpoint }
