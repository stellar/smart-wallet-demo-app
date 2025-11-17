import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnRegistration from 'api/core/helpers/webauthn/registration'
import { IWebAuthnRegistration } from 'api/core/helpers/webauthn/registration/types'
import OtpRepository from 'api/core/services/otp'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/recover/options/:code'

export class RecoverWalletOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private otpRepository: OtpRepositoryType
  private webauthnRegistrationHelper: IWebAuthnRegistration

  constructor(otpRepository?: OtpRepositoryType, webauthnRegistrationHelper?: IWebAuthnRegistration) {
    super()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
    this.webauthnRegistrationHelper = webauthnRegistrationHelper || WebAuthnRegistration.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { code: request.params?.code } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)
    const { code } = validatedData

    const otp = await this.otpRepository.getOtpByCode(code, { relations: ['user', 'user.passkeys'] })
    if (!otp) {
      throw new ResourceNotFoundException(messages.RECOVERY_LINK_PROVIDED_NOT_FOUND)
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException(messages.RECOVERY_LINK_EXPIRED)
    }

    const optionsJSON = await this.webauthnRegistrationHelper.generateOptions({
      user: otp.user,
    })

    return {
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved recover wallet options successfully',
    }
  }
}

export { endpoint }
