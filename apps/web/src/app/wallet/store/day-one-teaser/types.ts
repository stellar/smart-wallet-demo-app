export type DayOneTeaserStoreFields = {
  isClosed: boolean
}

export type DayOneTeaserStoreActions = {
  setIsClosed: (isClosed: boolean) => void
  clearIsClosed: () => void
}

export type DayOneTeaserStoreState = DayOneTeaserStoreFields & DayOneTeaserStoreActions
