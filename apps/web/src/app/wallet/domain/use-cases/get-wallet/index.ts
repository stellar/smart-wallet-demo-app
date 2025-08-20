import { UseCaseBase } from 'src/app/core/framework/use-case/base'
import { walletService } from 'src/app/wallet/services'
import { IWalletService } from 'src/app/wallet/services/wallet/types'
import { useWalletAddressStore } from 'src/app/wallet/store'
import { useWalletStatusStore } from 'src/app/wallet/store/wallet-status'

import { GetWalletResult } from './types'

export class GetWalletUseCase extends UseCaseBase<GetWalletResult> {
  private walletService: IWalletService

  constructor(walletService: IWalletService) {
    super()
    this.walletService = walletService
  }

  async handle(): Promise<GetWalletResult> {
    const { data } = await this.walletService.getWallet()

    useWalletAddressStore.getState().setWalletAddress(data.address)
    useWalletStatusStore.getState().setWalletStatus(data.status)

    return data
  }
}

const getWalletUseCase = new GetWalletUseCase(walletService)

export { getWalletUseCase }
