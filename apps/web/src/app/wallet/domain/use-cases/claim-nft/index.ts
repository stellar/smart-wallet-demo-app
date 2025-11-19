import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { walletService } from 'src/app/wallet/services'
import { IWalletService } from 'src/app/wallet/services/wallet/types'
import BaseError from 'src/helpers/error-handling/base-error'

import { ClaimNftInput } from './types'

export class ClaimNftUseCase extends UseCaseBase<void> {
  private walletService: IWalletService

  constructor(walletService: IWalletService) {
    super()
    this.walletService = walletService
  }

  async handle(input: ClaimNftInput): Promise<void> {
    if (!input.supply_id && (!input.session_id || !input.resource)) {
      throw new BaseError('Invalid input parameters.')
    }

    await this.walletService.claimNft({
      supply_id: input.supply_id,
      session_id: input.session_id,
      resource: input.resource,
    })
  }
}

const claimNftUseCase = new ClaimNftUseCase(walletService)

export { claimNftUseCase }
