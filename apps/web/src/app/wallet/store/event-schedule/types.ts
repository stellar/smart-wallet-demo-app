export type EventScheduleStoreFields = {
  isClosed: boolean
}

export type EventScheduleStoreActions = {
  setIsClosed: (isClosed: boolean) => void
  clearIsClosed: () => void
}

export type EventScheduleStoreState = EventScheduleStoreFields & EventScheduleStoreActions
