import { renderHook } from '@testing-library/react'

import { useAirdropStore } from '.'

describe('AirdropStore', () => {
  it('creates an airdrop store with initial state empty', () => {
    const store = renderHook(() => useAirdropStore()).result.current

    expect(store.isFirstOpen).toBeTruthy()
  })
})
