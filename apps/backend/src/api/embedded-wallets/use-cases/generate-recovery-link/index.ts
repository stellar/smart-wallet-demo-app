import path from 'path'

import { Request, Response } from 'express'

import { OtpRepositoryType } from 'api/core/entities/otp/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import OtpRepository from 'api/core/services/otp'
import UserRepository from 'api/core/services/user'
import { tryReadFile } from 'api/core/utils/file'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { getValueFromEnv } from 'config/env-utils'
import { SendGridService } from 'interfaces/email-provider/sendgrid'
import { EmailData, IEmailService } from 'interfaces/email-provider/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/send-recovery-link'

export class GenerateRecoveryLink extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private otpRepository: OtpRepositoryType
  private emailService: IEmailService
  private recoveryLinkBaseUrl: string
  private emailTemplate: string

  constructor(
    userRepository?: UserRepositoryType,
    otpRepository?: OtpRepositoryType,
    emailService?: IEmailService,
    recoveryLinkBaseUrl?: string,
    emailTemplate?: string
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.otpRepository = otpRepository || OtpRepository.getInstance()
    this.emailService = emailService || SendGridService.getInstance()

    const templatePath = path.join(__dirname, 'template.html')
    const fallbackPath = path.join(__dirname, 'template.example.html')
    this.emailTemplate =
      emailTemplate ||
      tryReadFile(templatePath) ||
      tryReadFile(fallbackPath) ||
      '<p>Click on the following link to recover your wallet: <a href="{{RECOVERY_LINK}}">Recover access</a></p>'

    if (recoveryLinkBaseUrl) {
      this.recoveryLinkBaseUrl = recoveryLinkBaseUrl
    } else {
      const frontendUrl = getValueFromEnv('FRONT_ADDRESS', 'http://localhost:3201')
      this.recoveryLinkBaseUrl = `${frontendUrl}/recover/confirm`
    }
  }

  prepareEmailData(email: string, otpCode: string): EmailData {
    const recoveryLink = `${this.recoveryLinkBaseUrl}?code=${otpCode}`

    return {
      to: email,
      subject: getValueFromEnv('RECOVERY_EMAIL_SUBJECT'),
      text: getValueFromEnv('RECOVERY_EMAIL_TEXT').replace('{{RECOVERY_LINK}}', recoveryLink),
      html: this.emailTemplate.replace('{{RECOVERY_LINK}}', recoveryLink),
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

    const user = await this.userRepository.getUserByEmail(requestBody.email, { relations: ['otps'] })
    const activeOtp = user?.otps?.find(otp => otp.expiresAt > new Date())

    // Fake response to protect against attackers: a non-existent user, a user with
    // no wallet yet, and a user with a pending OTP must all be indistinguishable from
    // the outside — otherwise this endpoint leaks account existence/state by status code.
    if (!user || !user.contractAddress || activeOtp) {
      return {
        data: {
          email_sent: true,
        },
        message: 'Recovery link sent successfully',
      }
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
