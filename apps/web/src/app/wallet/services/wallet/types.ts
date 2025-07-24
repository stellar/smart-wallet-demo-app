import { WalletStatus } from 'src/app/auth/domain/models/user'
import { IHTTPResponse } from 'src/interfaces/http/types'

export interface IWalletService {
  getWallet: () => Promise<GetWalletResult>
}

export type GetWalletResult = IHTTPResponse<{
  status: WalletStatus
  address?: string
  email?: string
  balance?: string
}>
