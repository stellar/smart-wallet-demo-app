import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EMAIL_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { EmailStoreFields, EmailStoreState } from './types'

const INITIAL_STATE: EmailStoreFields = {
  email: null,
}

export const useEmailStore = create<EmailStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setEmail: email => set({ email }),
      clearEmail: () => set({ email: null }),
    }),
    {
      name: EMAIL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
