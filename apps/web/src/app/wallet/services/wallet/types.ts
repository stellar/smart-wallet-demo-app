import { WalletStatus } from 'src/app/auth/domain/models/user'
import { IHTTPResponse } from 'src/interfaces/http/types'

import { Nft } from '../../domain/models/nft'
import { Transaction } from '../../domain/models/transaction'

export interface IWalletService {
  getWallet: () => Promise<GetWalletResult>
  getTransactionHistory: () => Promise<GetTransactionHistoryResult>
  getTransferOptions: (input: GetTransferOptionsInput) => Promise<GetTransferOptionsResult>
  postTransfer: (input: PostTransferInput) => Promise<PostTransferResult>
  getAirdropOptions: () => Promise<GetAirdropOptionsResult>
  postAirdrop: (input: PostAirdropInput) => Promise<PostAirdropResult>
  getNfts: () => Promise<GetNftsResult>
  getNftClaimOptions: (
    supply_id: string | undefined,
    session_id: string | undefined,
    resource: string | undefined
  ) => Promise<GetNftClaimOptionsResult>
  claimNft: (input: ClaimNftInput) => Promise<ClaimNftResult>
  getGiftOptions: (input: GetGiftOptionsInput) => Promise<GetGiftOptionsResult>
  postGift: (input: PostGiftInput) => Promise<PostAirdropResult>
  postFundWallet: (input: PostFundWalletInput) => Promise<PostFundWalletResult>
}

export type GetWalletResult = IHTTPResponse<{
  status: WalletStatus
  address: string
  email: string
  balance: number
  token_balances?: { contract_address: string; balance: number; type: 'nft' | 'asset' }[]
  is_airdrop_available: boolean
  is_gift_available: boolean
  swags?: {
    code: string
    name?: string
    description: string
    imageUrl?: string
    assetCode: string
    status: 'unclaimed' | 'claimed'
  }[]
  vendors?: {
    id: string
    name: string
    description?: string
    is_active: boolean
    display_order: number
    wallet_address?: string
    profile_image?: string
  }[]
}>
export type GetTransactionHistoryResult = IHTTPResponse<{
  address: string
  transactions: Transaction[]
}>

export const transferTypes = ['transfer', 'nft', 'swag'] as const
export type TransferTypes = (typeof transferTypes)[number]
export type TransferTypeParams = {
  type: Extract<TransferTypes, 'transfer'>
  to: string
  amount: number
  asset: string
  product?: string
}
export const isTransferTypeParams = (params: { type: TransferTypes }): params is TransferTypeParams =>
  params.type === 'transfer'

export type NftClaimTypeParams = {
  type: Extract<TransferTypes, 'nft'>
  supply_id: string | undefined
  session_id: string | undefined
  resource: string | undefined
}
export const isNftClaimTypeParams = (params: { type: TransferTypes }): params is NftClaimTypeParams =>
  params.type === 'nft'

export type NftTransferTypeParams = {
  type: Extract<TransferTypes, 'nft'>
  to: string
  asset: string
  id: string
}
export const isNftTransferTypeParams = (params: { type: TransferTypes }): params is NftTransferTypeParams =>
  params.type === 'nft' && 'to' in params && 'asset' in params && 'id' in params

export type SwagTypeParams = {
  type: Extract<TransferTypes, 'swag'>
  to: string
  amount: number
  asset: string
}
export const isSwagTypeParams = (params: { type: TransferTypes }): params is SwagTypeParams => params.type === 'swag'

export type GetTransferOptionsInput = TransferTypeParams | NftClaimTypeParams | NftTransferTypeParams | SwagTypeParams
export const transferOptionsInputKeys: (
  | keyof TransferTypeParams
  | keyof NftClaimTypeParams
  | keyof NftTransferTypeParams
  | keyof SwagTypeParams
)[] = ['type', 'to', 'amount', 'asset', 'session_id', 'resource', 'product', 'id']

export type GetTransferOptionsResult = IHTTPResponse<{
  options_json: string
  vendor?: {
    name?: string
    wallet_address?: string
    profile_image?: string
  }
  user: {
    address: string
    email: string
    balances: {
      amount: number
      asset: string
    }[]
  }
  products?: {
    product_id: string
    code: string
    name?: string
    description: string
  }[]
}>

export type PostTransferInput = {
  authenticationResponseJSON: string
} & GetTransferOptionsInput
export type PostTransferResult = IHTTPResponse<{
  hash: string
}>

export type GetAirdropOptionsResult = IHTTPResponse<{
  options_json: string
  user: {
    address: string
    email: string
  }
}>

export type PostAirdropInput = {
  authenticationResponseJSON: string
}
export type PostAirdropResult = IHTTPResponse<{
  hash: string
}>

export type GetNftsResult = IHTTPResponse<{
  nfts: Nft[]
}>

export type ClaimNftInput = {
  supply_id: string | undefined
  session_id: string | undefined
  resource: string | undefined
}

export type ClaimNftResult = IHTTPResponse<{
  hash: string
  tokenId: string
}>

export type GetNftClaimOptionsResult = IHTTPResponse<{
  nft: {
    name: string
    description: string
    url: string
    code: string
    contractAddress: string
    sessionId: string
    resource: string
    transaction_hash: string
    token_id: string
  }
}>

export type GetGiftOptionsInput = {
  giftId: string
}
export type GetGiftOptionsResult = IHTTPResponse<{
  options_json: string
  user: {
    address: string
    email: string
  }
}>

export type PostGiftInput = {
  giftId: string
  authenticationResponseJSON: string
}
export type PostGiftResult = IHTTPResponse<{
  hash: string
}>

export type PostFundWalletInput = {
  address: string
}
export type PostFundWalletResult = IHTTPResponse<{
  address: string
  transaction?: string
  networkPassphrase?: string
}>
