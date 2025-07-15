import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ACCESS_TOKEN_STORAGE_KEY, AUTH_TOKEN_CHANNEL_KEY } from 'src/app/auth/constants/storage'
import { AccessTokenStoreFields, AccessTokenStoreState } from './types'

const INITIAL_STATE: AccessTokenStoreFields = {
  accessToken: null,
}

const channel = new BroadcastChannel(AUTH_TOKEN_CHANNEL_KEY)

export const useAccessTokenStore = create<AccessTokenStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setAccessToken: (token, broadcast = true) => {
        set({ accessToken: token })
        if (broadcast) {
          channel.postMessage({ type: 'SET_TOKEN', token })
        }
      },

      clearAccessToken: (broadcast = true) => {
        set({ accessToken: null })
        if (broadcast) {
          channel.postMessage({ type: 'CLEAR_TOKEN' })
        }
      },
    }),
    {
      name: ACCESS_TOKEN_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
