import { Request, Response } from 'express'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { generateRegistrationOptions } from 'api/core/helpers/webauthn/registration/generate-options'

const endpoint = '/register/options/:email'

export class CreateWalletOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(userRepository?: UserRepositoryType, webauthnChallengeService?: IWebauthnChallengeService) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
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
    if (!user) {
      throw new ResourceNotFoundException(`User with email ${email} not found`)
    }

    const optionsJSON = await generateRegistrationOptions({
      user,
      webauthnChallengeService: this.webauthnChallengeService,
    })

    return {
      data: {
        options_json: optionsJSON,
      },
      message: 'Retrieved create wallet options successfully',
    }
  }
}

export { endpoint }
