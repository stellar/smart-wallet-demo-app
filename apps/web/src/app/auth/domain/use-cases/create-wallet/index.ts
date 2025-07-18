import { authService, webauthnService } from 'src/app/auth/services'
import { IAuthService } from 'src/app/auth/services/auth/types'
import { IWebAuthnService } from 'src/app/auth/services/webauthn/types'
import { useAccessTokenStore } from 'src/app/auth/store'
import { UseCaseBase } from 'src/app/core/framework/use-case/base'

import { CreateWalletInput } from './types'

export class CreateWalletUseCase extends UseCaseBase<void> {
  private authService: IAuthService
  private webauthnService: IWebAuthnService

  constructor(authService: IAuthService, webauthnService: IWebAuthnService) {
    super()
    this.authService = authService
    this.webauthnService = webauthnService
  }

  async handle(input: CreateWalletInput): Promise<void> {
    const { email } = input

    const { data: registerOptions } = await this.authService.getRegisterOptions({ email })
    const optionsJSON = JSON.parse(registerOptions.options_json)

    const { rawResponse: createPasskeyResponse } = await this.webauthnService.createPasskey({
      optionsJSON,
    })

    const { data: registerResult } = await this.authService.postRegister({
      email,
      registrationResponseJSON: JSON.stringify(createPasskeyResponse),
    })

    useAccessTokenStore.getState().setAccessToken(registerResult.token)
  }
}

const createWalletUseCase = new CreateWalletUseCase(authService, webauthnService)

export { createWalletUseCase }
