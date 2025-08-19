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
  getNfts: () => Promise<GetNftsResult>
  getNftClaimOptions: (session_id: string, resource: string) => Promise<GetNftClaimOptionsResult>
  claimNft: (input: ClaimNftInput) => Promise<ClaimNftResult>
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
export type NftClaimTypeParams = {
  type: Extract<TransferTypes, 'nft'>
  session_id: string
  resource: string
}

export const transferOptionsInputKeys: (keyof TransferTypeParams | keyof NftClaimTypeParams)[] = [
  'type',
  'to',
  'amount',
  'asset',
  'session_id',
  'resource',
]
export const isNftClaimTypeParams = (params: { type: TransferTypes }): params is NftClaimTypeParams =>
  params.type === 'nft' && 'session_id' in params && 'resource' in params

export type GetTransferOptionsInput = TransferTypeParams

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

export interface Nft {
  id?: string
  name: string
  description: string
  url: string
  code?: string
  issuer?: string
  resource?: string
}

export type GetNftsResult = IHTTPResponse<{
  nfts: Nft[]
}>

export type ClaimNftInput = {
  session_id: string
  resource: string
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
  }
}>
