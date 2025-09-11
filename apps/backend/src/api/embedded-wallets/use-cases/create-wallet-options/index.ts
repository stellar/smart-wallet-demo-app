import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnRegistration from 'api/core/helpers/webauthn/registration'
import { IWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/types'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/register/options'

export class CreateWalletOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private webauthnRegistrationHelper: IWebAuthnRegistration

  constructor(userRepository?: UserRepositoryType, webauthnRegistrationHelper?: IWebAuthnRegistration) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnRegistrationHelper = webauthnRegistrationHelper || WebAuthnRegistration.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const email = request.validatedInvitation?.email
    if (!email) {
      throw new ResourceNotFoundException(messages.EMAIL_NOT_FOUND_IN_TOKEN_DATA)
    }
    const payload = { email } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)
    const { email } = validatedData

    const user = await this.userRepository.getUserByEmail(email, { relations: ['passkeys'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    const optionsJSON = await this.webauthnRegistrationHelper.generateOptions({
      user,
    })

    return {
      data: {
        options_json: optionsJSON,
      },
      message: messages.CREATE_WALLET_OPTIONS_SUCCESS,
    }
  }
}

export { endpoint }
