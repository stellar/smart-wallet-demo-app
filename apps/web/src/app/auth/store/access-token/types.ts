export type AccessTokenStoreFields = {
  accessToken: string | null
}

export type AccessTokenStoreActions = {
  setAccessToken: (token: string | null, broadcast?: boolean) => void
  clearAccessToken: (broadcast?: boolean) => void
}

export type AccessTokenStoreState = AccessTokenStoreFields & AccessTokenStoreActions
