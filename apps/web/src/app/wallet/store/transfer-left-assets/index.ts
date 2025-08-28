import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { TRANSFER_LEFT_ASSETS_STORAGE_KEY } from 'src/app/auth/constants/storage'

import { TransferLeftAssetsStoreFields, TransferLeftAssetsStoreState } from './types'

const INITIAL_STATE: TransferLeftAssetsStoreFields = {
  isFirstOpen: true,
}

export const useTransferLeftAssetsStore = create<TransferLeftAssetsStoreState>()(
  persist(
    set => ({
      ...INITIAL_STATE,
      setIsFirstOpen: isFirstOpen => set({ isFirstOpen }),
      clearIsFirstOpen: () => set({ isFirstOpen: true }),
    }),
    {
      name: TRANSFER_LEFT_ASSETS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
