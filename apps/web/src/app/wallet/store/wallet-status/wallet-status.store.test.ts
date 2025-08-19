import { renderHook } from '@testing-library/react'

import { useWalletStatusStore } from '../wallet-status'

describe('WalletStatusStore', () => {
  it('creates an wallet-status store with initial state empty', () => {
    const store = renderHook(() => useWalletStatusStore()).result.current

    expect(store.status).toBeNull()
  })
})
