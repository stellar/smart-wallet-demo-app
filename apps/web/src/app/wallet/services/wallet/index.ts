import BaseError from 'src/helpers/error-handling/base-error'
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
  GetNftsResult,
  ClaimNftInput,
  ClaimNftResult,
  GetNftClaimOptionsResult,
  GetGiftOptionsResult,
  PostGiftInput,
  PostGiftResult,
  GetGiftOptionsInput,
  PostFundWalletInput,
  PostFundWalletResult,
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

  async getNfts(): Promise<GetNftsResult> {
    const response = await authHttp.get('/api/embedded-wallets/nft')

    return response.data
  }

  async getNftClaimOptions(
    supply_id: string | undefined,
    session_id: string | undefined,
    resource: string | undefined
  ): Promise<GetNftClaimOptionsResult> {
    if (!supply_id && (!session_id || !resource)) {
      throw new BaseError('Invalid input parameters.')
    }

    const response = await authHttp.get('/api/embedded-wallets/nft/claim/options', {
      params: { supply_id, session_id, resource },
    })

    return response.data
  }

  async claimNft(input: ClaimNftInput): Promise<ClaimNftResult> {
    const response = await authHttp.post(`/api/embedded-wallets/nft/claim/complete`, input)

    return response.data
  }

  async getGiftOptions(input: GetGiftOptionsInput): Promise<GetGiftOptionsResult> {
    const response = await authHttp.get('/api/embedded-wallets/gift/options', { params: input })

    return response.data
  }

  async postGift(input: PostGiftInput): Promise<PostGiftResult> {
    const response = await authHttp.post(`/api/embedded-wallets/gift/complete`, {
      giftId: input.giftId,
      authentication_response_json: input.authenticationResponseJSON,
    })

    return response.data
  }

  async postFundWallet(input: PostFundWalletInput): Promise<PostFundWalletResult> {
    const response = await authHttp.post(`/api/embedded-wallets/create-account`, {
      address: input.address,
    })

    return response.data
  }
}

const walletService = new WalletService()

export { walletService }
