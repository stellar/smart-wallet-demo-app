import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/login/complete'

export class LogIn extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication

  constructor(userRepository?: UserRepositoryType, webauthnAuthenticationHelper?: IWebAuthnAuthentication) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
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

    // Check auth challenge resolution
    const challengeResult = await this.webauthnAuthenticationHelper.complete({
      user,
      authenticationResponseJSON: requestBody.authentication_response_json,
    })

    if (!challengeResult) throw new UnauthorizedException(messages.UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION)

    // Generate JWT token
    const authToken = generateToken(user.userId, user.email)

    return {
      data: {
        token: authToken,
      },
      message: 'Log in completed successfully',
    }
  }
}

export { endpoint }
