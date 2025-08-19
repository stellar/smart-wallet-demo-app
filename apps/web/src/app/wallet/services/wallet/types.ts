import { WalletStatus } from 'src/app/auth/domain/models/user'
import { IHTTPResponse } from 'src/interfaces/http/types'

import { Transaction } from '../../domain/models/transaction'

export interface IWalletService {
  getWallet: () => Promise<GetWalletResult>
  getTransactionHistory: () => Promise<GetTransactionHistoryResult>
  getTransferOptions: (input: GetTransferOptionsInput) => Promise<GetTransferOptionsResult>
  postTransfer: (input: PostTransferInput) => Promise<PostTransferResult>
  getAirdropOptions: () => Promise<GetAirdropOptionsResult>
  postAirdrop: (input: PostAirdropInput) => Promise<PostAirdropResult>
}

export type GetWalletResult = IHTTPResponse<{
  status: WalletStatus
  address: string
  email: string
  balance: number
  is_airdrop_available: boolean
  swags?: {
    code: string
    name?: string
    description: string
    imageUrl?: string
    assetCode: string
    status: 'unclaimed' | 'claimed'
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
export type NftTypeParams = {
  type: Extract<TransferTypes, 'nft'>
  to: string
  id: string
  asset: string
}
export const isNftTypeParams = (params: { type: TransferTypes }): params is NftTypeParams => params.type === 'nft'
export type SwagTypeParams = {
  type: Extract<TransferTypes, 'swag'>
  to: string
  amount: number
  asset: string
}
export const isSwagTypeParams = (params: { type: TransferTypes }): params is SwagTypeParams => params.type === 'swag'

export type GetTransferOptionsInput = TransferTypeParams | NftTypeParams | SwagTypeParams
export const transferOptionsInputKeys: (keyof TransferTypeParams | keyof NftTypeParams)[] = [
  'type',
  'to',
  'amount',
  'asset',
  'id',
  'product',
]

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
    balance: number
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
