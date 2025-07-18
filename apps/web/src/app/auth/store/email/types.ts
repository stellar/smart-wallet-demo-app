export type EmailStoreFields = {
  email: string | null
}

export type EmailStoreActions = {
  setEmail: (email: string | null) => void
  clearEmail: () => void
}

export type EmailStoreState = EmailStoreFields & EmailStoreActions
