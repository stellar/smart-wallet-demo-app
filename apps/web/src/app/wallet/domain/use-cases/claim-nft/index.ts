import { webauthnService } from 'src/app/auth/services'
import { IWebAuthnService } from 'src/app/auth/services/webauthn/types'
import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { walletService } from 'src/app/wallet/services'
import { IWalletService } from 'src/app/wallet/services/wallet/types'

import { ClaimNftInput } from './types'

export class ClaimNftUseCase extends UseCaseBase<void> {
  private walletService: IWalletService
  private webauthnService: IWebAuthnService

  constructor(walletService: IWalletService, webauthnService: IWebAuthnService) {
    super()
    this.walletService = walletService
    this.webauthnService = webauthnService
  }

  async handle(input: ClaimNftInput): Promise<void> {
    await this.walletService.claimNft({
      session_id: input.session_id,
      resource: input.resource,
    })
  }
}

const claimNftUseCase = new ClaimNftUseCase(walletService, webauthnService)

export { claimNftUseCase }
