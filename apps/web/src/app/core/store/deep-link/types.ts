export type DeepLinkStoreFields = {
  deepLink: string | null
}

export type DeepLinkStoreActions = {
  setDeepLink: (deepLink: string | null) => void
  clearDeepLink: () => void
}

export type DeepLinkStoreState = DeepLinkStoreFields & DeepLinkStoreActions
