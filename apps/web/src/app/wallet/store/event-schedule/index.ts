import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EVENT_SCHEDULE_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { EventScheduleStoreFields, EventScheduleStoreState } from './types'

const INITIAL_STATE: EventScheduleStoreFields = {
  isClosed: false,
}

export const useEventScheduleStore = create<EventScheduleStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsClosed: isClosed => set({ isClosed }),
      clearIsClosed: () => set({ isClosed: false }),
    }),
    {
      name: EVENT_SCHEDULE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
