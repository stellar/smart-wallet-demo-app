import { renderHook } from '@testing-library/react'

import { useWalletStatusStore } from '../wallet-status'

describe('EmailStore', () => {
  it('creates an wallet-status store with initial state empty', () => {
    const store = renderHook(() => useWalletStatusStore()).result.current

    expect(store.status).toBeNull()
  })
})
