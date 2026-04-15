import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { DAY_ONE_TEASER_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { DayOneTeaserStoreFields, DayOneTeaserStoreState } from './types'

const INITIAL_STATE: DayOneTeaserStoreFields = {
  isClosed: false,
}

export const useDayOneTeaserStore = create<DayOneTeaserStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsClosed: isClosed => set({ isClosed }),
      clearIsClosed: () => set({ isClosed: false }),
    }),
    {
      name: DAY_ONE_TEASER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
