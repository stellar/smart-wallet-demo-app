import * as jwt from 'jsonwebtoken'

import { useAccessTokenStore, useEmailStore } from 'src/app/auth/store'

export const storeSessionInfo = (accessToken: string) => {
  const decodedToken = jwt.decode(accessToken) as jwt.JwtPayload
  useAccessTokenStore.getState().setAccessToken(accessToken)
  useEmailStore.getState().setEmail(decodedToken.email)
}
