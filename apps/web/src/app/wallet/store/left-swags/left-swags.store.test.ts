import { renderHook } from '@testing-library/react'

import { useLeftSwagsStore } from '.'

describe('LeftSwagsStore', () => {
  it('creates an left-swags store with initial state empty', () => {
    const store = renderHook(() => useLeftSwagsStore()).result.current

    expect(store.isClosed).toBeTruthy()
  })
})
