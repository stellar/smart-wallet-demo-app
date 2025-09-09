import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { DEEP_LINK_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { DeepLinkStoreFields, DeepLinkStoreState } from './types'

const INITIAL_STATE: DeepLinkStoreFields = {
  deepLink: null,
}

export const useDeepLinkStore = create<DeepLinkStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setDeepLink: deepLink => set({ deepLink }),
      clearDeepLink: () => set({ deepLink: null }),
    }),
    {
      name: DEEP_LINK_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
