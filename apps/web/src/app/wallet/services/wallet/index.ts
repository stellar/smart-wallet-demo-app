import { authHttp } from 'src/interfaces/http'

import {
  GetWalletResult,
  GetTransactionHistoryResult,
  IWalletService,
  GetTransferOptionsInput,
  GetTransferOptionsResult,
  PostTransferInput,
  PostTransferResult,
  GetAirdropOptionsResult,
  PostAirdropInput,
  PostAirdropResult,
} from './types'

export class WalletService implements IWalletService {
  async getWallet(): Promise<GetWalletResult> {
    const response = await authHttp.get('/api/embedded-wallets')

    return response.data
  }

  async getTransactionHistory(): Promise<GetTransactionHistoryResult> {
    const response = await authHttp.get('/api/embedded-wallets/tx-history')

    return response.data
  }

  async getTransferOptions(input: GetTransferOptionsInput): Promise<GetTransferOptionsResult> {
    const response = await authHttp.get('/api/embedded-wallets/transfer/options', { params: input })

    return response.data
  }

  async postTransfer(input: PostTransferInput): Promise<PostTransferResult> {
    const { authenticationResponseJSON, ...rest } = input

    const response = await authHttp.post(`/api/embedded-wallets/transfer/complete`, {
      authentication_response_json: authenticationResponseJSON,
      ...rest,
    })

    return response.data
  }

  async getAirdropOptions(): Promise<GetAirdropOptionsResult> {
    const response = await authHttp.get('/api/embedded-wallets/airdrop/options')

    return response.data
  }

  async postAirdrop(input: PostAirdropInput): Promise<PostAirdropResult> {
    const response = await authHttp.post(`/api/embedded-wallets/airdrop/complete`, {
      authentication_response_json: input.authenticationResponseJSON,
    })

    return response.data
  }
}

const walletService = new WalletService()

export { walletService }
