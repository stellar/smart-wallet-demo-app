import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { WALLET_STATUS_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { WalletStatusStoreFields, WalletStatusStoreState } from './types'

const INITIAL_STATE: WalletStatusStoreFields = {
  status: null,
}

export const useWalletStatusStore = create<WalletStatusStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setWalletStatus: status => set({ status }),
      clearWalletStatus: () => set({ status: null }),
    }),
    {
      name: WALLET_STATUS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
