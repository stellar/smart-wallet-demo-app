import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { completeRegistration } from 'api/core/helpers/webauthn/registration/complete-registration'
import OtpRepository from 'api/core/services/otp'
import PasskeyRepository from 'api/core/services/passkey'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { generateToken } from 'interfaces/jwt'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/recover/complete'

export class RecoverWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private otpRepository: OtpRepositoryType
  private passkeyRepository: PasskeyRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(
    otpRepository?: OtpRepositoryType,
    passkeyRepository?: PasskeyRepositoryType,
    webauthnChallengeService?: IWebauthnChallengeService
  ) {
    super()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
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

    // Check if OTP exists
    const otp = await this.otpRepository.getOtpByCode(requestBody.code, { relations: ['user', 'user.passkeys'] })
    if (!otp) {
      throw new ResourceNotFoundException(`OTP with code ${requestBody.code} not found`)
    }

    // Check auth challenge resolution
    const challengeResult = await completeRegistration({
      user: otp.user,
      registrationResponseJSON: requestBody.registration_response_json,
      passkeyRepository: this.passkeyRepository,
      webauthnChallengeService: this.webauthnChallengeService,
    })

    if (!challengeResult) throw new UnauthorizedException(`User authentication failed`)

    // TODO: Pending
    // extract passkey and
    // execute recovery here

    // Generate JWT token
    const authToken = generateToken(otp.user.userId, otp.user.email)

    return {
      data: {
        token: authToken,
      },
      message: 'Wallet recovery completed successfully',
    }
  }
}

export { endpoint }
