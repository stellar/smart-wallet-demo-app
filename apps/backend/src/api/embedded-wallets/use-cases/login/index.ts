import { Request, Response } from 'express'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import PasskeyRepository from 'api/core/services/passkey'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { completeAuthentication } from 'api/core/helpers/webauthn/authentication/complete-authentication'

const endpoint = '/login/complete'

export class LogIn extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private passkeyRepository: PasskeyRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(
    userRepository?: UserRepositoryType,
    passkeyRepository?: PasskeyRepositoryType,
    webauthnChallengeService?: IWebauthnChallengeService
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.passkeyRepository = passkeyRepository || PasskeyRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
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

    // Check auth challenge resolution
    const challengeResult = await completeAuthentication({
      user,
      authenticationResponseJSON: requestBody.authentication_response_json,
      passkeyRepository: this.passkeyRepository,
      webauthnChallengeService: this.webauthnChallengeService,
    })

    if (!challengeResult) throw new UnauthorizedException(`User authentication failed`)

    return {
      data: {
        //TODO: update with session management token
        token: 'valid-token',
      },
      message: 'Log in completed successfully',
    }
  }
}

export { endpoint }
