import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import OtpRepository from 'api/core/services/otp'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { getValueFromEnv } from 'config/env-utils'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { SendGridService } from 'interfaces/email-provider/sendgrid'
import { EmailData, IEmailService } from 'interfaces/email-provider/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/send-recovery-link'

export class GenerateRecoveryLink extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private otpRepository: OtpRepositoryType
  private emailService: IEmailService
  private recoveryLinkBaseUrl: string

  constructor(
    userRepository?: UserRepositoryType,
    otpRepository?: OtpRepositoryType,
    emailService?: IEmailService,
    recoveryLinkBaseUrl?: string
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
    this.emailService = emailService || SendGridService.getInstance()

    if (recoveryLinkBaseUrl) {
      this.recoveryLinkBaseUrl = recoveryLinkBaseUrl
    } else {
      const frontendUrl = getValueFromEnv('FRONT_ADDRESS', 'http://localhost:3000')
      this.recoveryLinkBaseUrl = `${frontendUrl}/recover/confirm`
    }
  }

  prepareEmailData(email: string, otpCode: string): EmailData {
    const recoveryLink = `${this.recoveryLinkBaseUrl}?code=${otpCode}`
    return {
      to: email,
      subject: 'Recovery Link',
      text: `This is your recovery link: ${recoveryLink}`,
      html: `<p>Click on the following link to recover your wallet: <a href="${recoveryLink}">${recoveryLink}</a></p>`,
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
    const user = await this.userRepository.getUserByEmail(requestBody.email, { relations: ['otps'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    // Check if user has a wallet
    if (!user.contractAddress) {
      throw new BadRequestException(messages.USER_DOES_NOT_HAVE_WALLET)
    }

    // Check if user has any valid OTP
    const activeOtp = user.otps?.find(otp => otp.expiresAt > new Date())
    if (activeOtp) {
      throw new ResourceConflictedException(messages.ALREADY_SENT_RECOVERY_LINK)
    }

    // Create new OTP
    const newOtp = await this.otpRepository.createOtp(user, true)

    // Send recovery link via email
    await this.emailService.sendEmail(this.prepareEmailData(requestBody.email, newOtp.code))

    return {
      data: {
        email_sent: true,
      },
      message: 'Recovery link sent successfully',
    }
  }
}

export { endpoint }
