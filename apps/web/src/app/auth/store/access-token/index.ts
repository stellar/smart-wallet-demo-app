import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ACCESS_TOKEN_STORAGE_KEY, AUTH_TOKEN_CHANNEL_KEY } from 'src/app/auth/constants/storage'
import { router } from 'src/app/core/router'

import { AccessTokenStoreFields, AccessTokenStoreState } from './types'
import { AuthPagesPath } from '../../routes/types'

const INITIAL_STATE: AccessTokenStoreFields = {
  accessToken: null,
}

const channel = new BroadcastChannel(AUTH_TOKEN_CHANNEL_KEY)

export const useAccessTokenStore = create<AccessTokenStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setAccessToken: (token, redirectTo, broadcast = true) => {
        set({ accessToken: token })
        if (broadcast) channel.postMessage({ type: 'SET_TOKEN', token })
        if (redirectTo) router.history.push(redirectTo)
      },

      clearAccessToken: (redirectTo = AuthPagesPath.LOGIN, broadcast = true) => {
        set({ accessToken: null })
        if (broadcast) channel.postMessage({ type: 'CLEAR_TOKEN' })
        if (redirectTo) router.history.push(redirectTo)
      },
    }),
    {
      name: ACCESS_TOKEN_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
