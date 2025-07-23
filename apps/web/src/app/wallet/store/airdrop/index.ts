import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AIRDROP_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { AirdropStoreFields, AirdropStoreState } from './types'

const INITIAL_STATE: AirdropStoreFields = {
  isFirstOpen: true,
}

export const useAirdropStore = create<AirdropStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsFirstOpen: isFirstOpen => set({ isFirstOpen }),
      clearIsFirstOpen: () => set({ isFirstOpen: true }),
    }),
    {
      name: AIRDROP_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
