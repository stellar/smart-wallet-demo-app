import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { BEHIND_SCENES_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { BehindScenesStoreFields, BehindScenesStoreState } from './types'

const INITIAL_STATE: BehindScenesStoreFields = {
  isFirstOpen: true,
}

export const useBehindScenesStore = create<BehindScenesStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsFirstOpen: isFirstOpen => set({ isFirstOpen }),
      clearIsFirstOpen: () => set({ isFirstOpen: true }),
    }),
    {
      name: BEHIND_SCENES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
