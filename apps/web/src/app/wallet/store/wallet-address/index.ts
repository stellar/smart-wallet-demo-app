import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EMAIL_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { WalletAddressStoreFields, WalletAddressStoreState } from './types'

const INITIAL_STATE: WalletAddressStoreFields = {
  address: null,
}

export const useWalletAddressStore = create<WalletAddressStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setWalletAddress: address => set({ address }),
      clearWalletAddress: () => set({ address: null }),
    }),
    {
      name: EMAIL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
