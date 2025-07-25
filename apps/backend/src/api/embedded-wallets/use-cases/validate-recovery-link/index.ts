import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import OtpRepository from 'api/core/services/otp'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/validate-recovery-link'

export class ValidateRecoveryLink extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private otpRepository: OtpRepositoryType

  constructor(otpRepository?: OtpRepositoryType) {
    super()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
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
    const otp = await this.otpRepository.getOtpByCode(requestBody.code)
    if (!otp) {
      throw new ResourceNotFoundException(`OTP with code ${requestBody.code} not found`)
    }

    return {
      data: {
        is_valid: otp.expiresAt > new Date(),
      },
      message: 'Recovery link validated successfully',
    }
  }
}

export { endpoint }
