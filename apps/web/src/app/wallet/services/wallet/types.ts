import { WalletStatus } from 'src/app/auth/domain/models/user'
import { IHTTPResponse } from 'src/interfaces/http/types'

import { Transaction } from '../../domain/models/transaction'

export interface IWalletService {
  getWallet: () => Promise<GetWalletResult>
  getTransactionHistory: () => Promise<GetTransactionHistoryResult>
  getTransferOptions: (input: GetTransferOptionsInput) => Promise<GetTransferOptionsResult>
  postTransfer: (input: PostTransferInput) => Promise<PostTransferResult>
}

export type GetWalletResult = IHTTPResponse<{
  status: WalletStatus
  address: string
  email: string
  balance: number
}>
export type GetTransactionHistoryResult = IHTTPResponse<{
  address: string
  transactions: Transaction[]
}>

export type TransferTypes = 'transfer'
export type TransferTypeParams = {
  type: Extract<TransferTypes, 'transfer'>
  to: string
  amount: number
  asset: string
}
export const isTransferTypeParams = (params: { type: TransferTypes }): params is TransferTypeParams =>
  params.type === 'transfer'

export type GetTransferOptionsInput = TransferTypeParams
export type GetTransferOptionsResult = IHTTPResponse<{
  options_json: string
  vendor?: {
    name?: string
    walletAddress?: string
    profileImage?: string
  }
}>

export type PostTransferInput = {
  authenticationResponseJSON: string
} & TransferTypeParams
export type PostTransferResult = IHTTPResponse<{
  hash: string
}>
