import { Request, Response } from 'express'

import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { completeRegistration } from 'api/core/helpers/webauthn/registration/complete-registration'
import PasskeyRepository from 'api/core/services/passkey'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/register/complete'

export class CreateWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private passkeyRepository: PasskeyRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType
  private walletBackend: WalletBackend

  constructor(
    userRepository?: UserRepositoryType,
    passkeyRepository?: PasskeyRepositoryType,
    webauthnChallengeService?: IWebauthnChallengeService,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType,
    walletBackend?: WalletBackend
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.passkeyRepository = passkeyRepository || PasskeyRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
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
      throw new ResourceNotFoundException(`User with email ${requestBody.email} not found`)
    }

    // Check if user already has a wallet
    if (user.contractAddress) {
      throw new ResourceConflictedException(`User with email ${requestBody.email} already has a wallet`)
    }

    // Check auth challenge resolution
    const challengeResult = await completeRegistration({
      user,
      registrationResponseJSON: requestBody.registration_response_json,
      passkeyRepository: this.passkeyRepository,
      webauthnChallengeService: this.webauthnChallengeService,
    })

    if (!challengeResult) throw new UnauthorizedException(`User authentication failed`)

    const { passkey, publicKeyHex } = challengeResult

    if (!publicKeyHex) throw new ResourceNotFoundException(`Authentication method public key not found`)

    // Create wallet using SDP
    const newWallet = await this.sdpEmbeddedWallets.createWallet({
      token: user.uniqueToken,
      credential_id: passkey.credentialId,
      public_key: publicKeyHex,
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
