import { IAuthService } from 'src/app/auth/services/auth/types'
import { IWebAuthnService } from 'src/app/auth/services/webauthn/types'
import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { LogInInput } from './types'
import { authService, webauthnService } from 'src/app/auth/services'
import { useAccessTokenStore } from 'src/app/auth/store'

export class LogInUseCase extends UseCaseBase<void> {
  private authService: IAuthService
  private webauthnService: IWebAuthnService

  constructor(authService: IAuthService, webauthnService: IWebAuthnService) {
    super()
    this.authService = authService
    this.webauthnService = webauthnService
  }

  async handle(input: LogInInput): Promise<void> {
    const { email } = input

    const { data: logInOptions } = await this.authService.getLogInOptions({ email })
    const optionsJSON = JSON.parse(logInOptions.options_json)

    const { rawResponse: authenticateWithPasskeyResponse } = await this.webauthnService.authenticateWithPasskey({
      optionsJSON,
    })

    const { data: logInResult } = await this.authService.postLogIn({
      email,
      authenticationResponseJSON: JSON.stringify(authenticateWithPasskeyResponse),
    })

    useAccessTokenStore.getState().setAccessToken(logInResult.token)
    // TODO: save email from token on email store
  }
}

const logInUseCase = new LogInUseCase(authService, webauthnService)

export { logInUseCase }
