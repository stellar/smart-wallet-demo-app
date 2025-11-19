export type LayoutStoreFields = {
  layout: 'mobile' | 'desktop'
}

export type LayoutStoreActions = {
  setLayout: (layout: 'mobile' | 'desktop') => void
  clearLayout: () => void
}

export type LayoutStoreState = LayoutStoreFields & LayoutStoreActions
