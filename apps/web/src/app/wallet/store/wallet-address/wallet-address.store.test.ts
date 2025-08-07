import { renderHook } from '@testing-library/react'

import { useWalletAddressStore } from '../wallet-address'

describe('EmailStore', () => {
  it('creates an wallet-address store with initial state empty', () => {
    const store = renderHook(() => useWalletAddressStore()).result.current

    expect(store.address).toBeNull()
  })
})
