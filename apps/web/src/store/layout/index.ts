import { create } from 'zustand'

import { LayoutStoreFields, LayoutStoreState } from './types'

const INITIAL_STATE: LayoutStoreFields = {
  layout: 'mobile',
}

export const useLayoutStore = create<LayoutStoreState>()(set => ({
  ...INITIAL_STATE,
  setLayout: layout => set({ layout }),
  clearLayout: () => set({ layout: 'mobile' }),
}))
