import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ACCESS_TOKEN_STORAGE_KEY, AUTH_TOKEN_CHANNEL_KEY } from 'src/app/auth/constants/storage'
import { CoreQueryKeys } from 'src/app/core/queries/query-keys'
import { router } from 'src/app/core/router'
import { useWalletAddressStore, useWalletStatusStore } from 'src/app/wallet/store'
import { queryClient } from 'src/interfaces/query-client'

import { AccessTokenStoreFields, AccessTokenStoreState } from './types'
import { AuthPagesPath } from '../../routes/types'
import { useEmailStore } from '../email'

const INITIAL_STATE: AccessTokenStoreFields = {
  accessToken: null,
}

const channel = new BroadcastChannel(AUTH_TOKEN_CHANNEL_KEY)

export const useAccessTokenStore = create<AccessTokenStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      /**
       * Sets the access token and broadcasts the change to other tabs.
       *
       * If `redirectTo` is provided, the user is redirected to the given path
       * after setting the access token. By default, the user is not redirected.
       * Also, the current router cache is cleaned.
       *
       * If `broadcast` is false, the change is not broadcasted to other tabs.
       *
       * @param token - The access token to set.
       * @param redirectTo - The path to redirect the user to after setting the
       * access token. Defaults to `undefined`.
       * @param broadcast - Whether to broadcast the change to other tabs.
       * Defaults to `true`.
       */
      setAccessToken: (token, redirectTo, broadcast = true) => {
        set({ accessToken: token })
        if (broadcast) channel.postMessage({ type: 'SET_TOKEN', token })
        if (redirectTo) {
          router.clearCache()
          router.history.push(redirectTo)
        }
      },

      /**
       * Clears the access token and broadcasts the change to other tabs.
       *
       * If `redirectTo` is provided, the user is redirected to the given path
       * after clearing the access token. By default, the user is redirected to
       * the login page. Also, the current router cache is cleaned.
       *
       * If `broadcast` is false, the change is not broadcasted to other tabs.
       *
       * @param redirectTo - The path to redirect the user to after clearing the
       * access token. Defaults to `AuthPagesPath.WELCOME`.
       * @param broadcast - Whether to broadcast the change to other tabs.
       * Defaults to `true`.
       */
      clearAccessToken: (redirectTo = AuthPagesPath.WELCOME, broadcast = true) => {
        queryClient.clearExcept([[CoreQueryKeys.GetFeatureFlags]])

        set({ accessToken: null })
        useEmailStore.getState().clearEmail()
        useWalletAddressStore.getState().clearWalletAddress()
        useWalletStatusStore.getState().clearWalletStatus()

        if (broadcast) channel.postMessage({ type: 'CLEAR_TOKEN' })
        if (redirectTo) {
          router.clearCache()
          router.history.push(redirectTo)
        }
      },
    }),
    {
      name: ACCESS_TOKEN_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
