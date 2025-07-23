export type AirdropStoreFields = {
  isFirstOpen: boolean
}

export type AirdropStoreActions = {
  setIsFirstOpen: (isFirstOpen: boolean) => void
  clearIsFirstOpen: () => void
}

export type AirdropStoreState = AirdropStoreFields & AirdropStoreActions
