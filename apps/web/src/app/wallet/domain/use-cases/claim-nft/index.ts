import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { walletService } from 'src/app/wallet/services'
import { IWalletService } from 'src/app/wallet/services/wallet/types'

import { ClaimNftInput } from './types'

export class ClaimNftUseCase extends UseCaseBase<void> {
  private walletService: IWalletService

  constructor(walletService: IWalletService) {
    super()
    this.walletService = walletService
  }

  async handle(input: ClaimNftInput): Promise<void> {
    await this.walletService.claimNft({
      session_id: input.session_id,
      resource: input.resource,
    })
  }
}

const claimNftUseCase = new ClaimNftUseCase(walletService)

export { claimNftUseCase }
