import { WalletStatus } from 'src/app/auth/domain/models/user'

export type GetWalletResult = {
  status: WalletStatus
  address: string
  email: string
  balance: number
}
