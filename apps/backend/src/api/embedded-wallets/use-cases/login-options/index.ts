import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/login/options/:email'

export class LogInOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication

  constructor(userRepository?: UserRepositoryType, webauthnAuthenticationHelper?: IWebAuthnAuthentication) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { email: request.params?.email } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)
    const { email } = validatedData

    const user = await this.userRepository.getUserByEmail(email, { relations: ['passkeys'] })

    // Fake response to protect against attackers: a non-existent user and a user
    // with no registered passkeys must be indistinguishable from the outside,
    // otherwise this endpoint leaks account existence/registration status by email.
    if (!user || !user.passkeys.length) {
      return {
        data: {
          options_json: null,
        },
        message: 'Retrieved log in options successfully',
      }
    }

    const optionsJSON = await this.webauthnAuthenticationHelper.generateOptions({
      type: 'standard',
      user,
    })

    return {
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved log in options successfully',
    }
  }
}

export { endpoint }
