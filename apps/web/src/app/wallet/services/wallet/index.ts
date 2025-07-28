import { http } from 'src/interfaces/http'

import { GetWalletResult, GetTransactionHistoryResult, IWalletService } from './types'

export class WalletService implements IWalletService {
  async getWallet(): Promise<GetWalletResult> {
    const response = await http.get('/api/embedded-wallets')

    return response.data
  }

  async getTransactionHistory(): Promise<GetTransactionHistoryResult> {
    const response = await http.get('/api/embedded-wallets/tx-history')

    return response.data
  }
}

const walletService = new WalletService()

export { walletService }
export * from './transaction-mapper'
