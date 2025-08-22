import { WalletStatus } from 'src/app/auth/domain/models/user'

export type GetWalletResult = {
  status: WalletStatus
  address: string
  email: string
  balance: number
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
}
