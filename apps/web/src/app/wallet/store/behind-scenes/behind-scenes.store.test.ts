import { renderHook } from '@testing-library/react'

import { useBehindScenesStore } from '.'

describe('BehindScenesStore', () => {
  it('creates an behind-scenes store with initial state empty', () => {
    const store = renderHook(() => useBehindScenesStore()).result.current

    expect(store.isFirstOpen).toBeTruthy()
  })
})
