import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { LEFT_SWAGS_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { LeftSwagsStoreFields, LeftSwagsStoreState } from './types'

const INITIAL_STATE: LeftSwagsStoreFields = {
  isClosed: false,
}

export const useLeftSwagsStore = create<LeftSwagsStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsClosed: isClosed => set({ isClosed }),
      clearIsClosed: () => set({ isClosed: false }),
    }),
    {
      name: LEFT_SWAGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
