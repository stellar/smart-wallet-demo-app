export type TransferLeftAssetsStoreFields = {
  isFirstOpen: boolean
}

export type TransferLeftAssetsStoreActions = {
  setIsFirstOpen: (isFirstOpen: boolean) => void
  clearIsFirstOpen: () => void
}

export type TransferLeftAssetsStoreState = TransferLeftAssetsStoreFields & TransferLeftAssetsStoreActions
