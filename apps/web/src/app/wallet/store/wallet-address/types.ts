export type WalletAddressStoreFields = {
  address: string | null
}

export type WalletAddressStoreActions = {
  setWalletAddress: (address: string | null) => void
  clearWalletAddress: () => void
}

export type WalletAddressStoreState = WalletAddressStoreFields & WalletAddressStoreActions
