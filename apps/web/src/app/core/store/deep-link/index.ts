import { create } from 'zustand'

import { DeepLinkStoreFields, DeepLinkStoreState } from './types'

const INITIAL_STATE: DeepLinkStoreFields = {
  deepLink: null,
}

export const useDeepLinkStore = create<DeepLinkStoreState>()(set => ({
  ...INITIAL_STATE,
  setDeepLink: deepLink => set({ deepLink }),
  clearDeepLink: () => set({ deepLink: null }),
}))
