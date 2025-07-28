import { WalletStatus } from 'src/app/auth/domain/models/user'
import { IHTTPResponse } from 'src/interfaces/http/types'

export interface IWalletService {
  getWallet: () => Promise<GetWalletResult>
  getTransactionHistory: () => Promise<GetTransactionHistoryResult>
}

export type GetWalletResult = IHTTPResponse<{
  status: WalletStatus
  address?: string
  email?: string
  balance?: string
}>

export interface Transaction {
  hash: string
  envelopeXdr: string
  operations: Operation[]
}

export interface Operation {
  id: string
  operationXdr: string
}

export interface UITransaction {
  id: string
  type: string
  vendor: string
  amount: number
  asset: string
  date: string
  txId: string
}

export type GetTransactionHistoryResult = IHTTPResponse<{
  address: string
  transactions: Transaction[]
}>
