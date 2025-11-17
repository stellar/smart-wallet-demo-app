export type AccessTokenStoreFields = {
  accessToken: string | null
}

export type AccessTokenStoreActions = {
  setAccessToken: (token: string | null, redirectTo?: string, broadcast?: boolean) => void
  clearAccessToken: (redirectTo?: string, broadcast?: boolean) => void
}

export type AccessTokenStoreState = AccessTokenStoreFields & AccessTokenStoreActions
