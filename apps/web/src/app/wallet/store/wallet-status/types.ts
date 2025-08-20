import { WalletStatus } from 'src/app/auth/domain/models/user'

export type WalletStatusStoreFields = {
  status: WalletStatus | null
}

export type WalletStatusStoreActions = {
  setWalletStatus: (status: WalletStatus | null) => void
  clearWalletStatus: () => void
}

export type WalletStatusStoreState = WalletStatusStoreFields & WalletStatusStoreActions
