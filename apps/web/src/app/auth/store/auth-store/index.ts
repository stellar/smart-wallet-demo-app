import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AUTH_STORAGE_KEY } from 'src/app/auth/constants/storage'
import { AuthStore, AuthStoreState, CurrentUser } from 'src/app/auth/store/auth-store/types'

const INITIAL_STATE: AuthStoreState = {
  currentUser: undefined,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      isAuthenticated: () => {
        return !!get().currentUser
      },
      setCurrentUser: (user: CurrentUser | null) => {
        set({ currentUser: user ?? undefined })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
