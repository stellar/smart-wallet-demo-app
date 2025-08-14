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
}>
export type GetTransactionHistoryResult = IHTTPResponse<{
  address: string
  transactions: Transaction[]
}>

export const transferTypes = ['transfer', 'nft'] as const
export type TransferTypes = (typeof transferTypes)[number]
export type TransferTypeParams = {
  type: Extract<TransferTypes, 'transfer'>
  to: string
  amount: number
  asset: string
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

export type GetTransferOptionsInput = TransferTypeParams | NftTypeParams
export const transferOptionsInputKeys: (keyof TransferTypeParams | keyof NftTypeParams)[] = [
  'type',
  'to',
  'amount',
  'asset',
  'id',
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
