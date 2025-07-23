import { http } from 'src/interfaces/http'

import { GetWalletResult, IWalletService } from './types'

export class WalletService implements IWalletService {
  async getWallet(): Promise<GetWalletResult> {
    const response = await http.get('/api/embedded-wallets')

    return response.data
  }
}

const walletService = new WalletService()

export { walletService }
