import { webauthnService } from 'src/app/auth/services'
import { IWebAuthnService } from 'src/app/auth/services/webauthn/types'
import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { walletService } from 'src/app/wallet/services'
import { IWalletService } from 'src/app/wallet/services/wallet/types'

import { TransferInput } from './types'

export class TransferUseCase extends UseCaseBase<void> {
  private walletService: IWalletService
  private webauthnService: IWebAuthnService

  constructor(walletService: IWalletService, webauthnService: IWebAuthnService) {
    super()
    this.walletService = walletService
    this.webauthnService = webauthnService
  }

  async handle(input: TransferInput): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Start WebAuthn authentication (touchID/fingerprint/pin auth on the user's device)
    const { rawResponse: authenticateWithPasskeyResponse } = await this.webauthnService.authenticateWithPasskey({
      optionsJSON: JSON.parse(input.optionsJSON),
    })

    // Complete the transfer on the server (challenge validation and tx submission)
    await this.walletService.postTransfer({
      ...input,
      authenticationResponseJSON: JSON.stringify(authenticateWithPasskeyResponse),
    })
  }
}

const transferUseCase = new TransferUseCase(walletService, webauthnService)

export { transferUseCase }
