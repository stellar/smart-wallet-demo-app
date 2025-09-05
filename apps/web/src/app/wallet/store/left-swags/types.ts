export type LeftSwagsStoreFields = {
  isClosed: boolean
}

export type LeftSwagsStoreActions = {
  setIsClosed: (isClosed: boolean) => void
  clearIsClosed: () => void
}

export type LeftSwagsStoreState = LeftSwagsStoreFields & LeftSwagsStoreActions
