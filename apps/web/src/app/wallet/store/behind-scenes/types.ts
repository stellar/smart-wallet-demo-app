export type BehindScenesStoreFields = {
  isFirstOpen: boolean
}

export type BehindScenesStoreActions = {
  setIsFirstOpen: (isFirstOpen: boolean) => void
  clearIsFirstOpen: () => void
}

export type BehindScenesStoreState = BehindScenesStoreFields & BehindScenesStoreActions
