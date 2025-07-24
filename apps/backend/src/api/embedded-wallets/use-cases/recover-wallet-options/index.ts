import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { generateRegistrationOptions } from 'api/core/helpers/webauthn/registration/generate-options'
import OtpRepository from 'api/core/services/otp'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/recover/options/:code'

export class RecoverWalletOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private otpRepository: OtpRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(otpRepository?: OtpRepositoryType, webauthnChallengeService?: IWebauthnChallengeService) {
    super()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
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
      throw new ResourceNotFoundException(`OTP with code ${code} not found`)
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException(`OTP with code ${code} has expired`)
    }

    const user = otp.user
    const optionsJSON = await generateRegistrationOptions({
      user,
      webauthnChallengeService: this.webauthnChallengeService,
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
