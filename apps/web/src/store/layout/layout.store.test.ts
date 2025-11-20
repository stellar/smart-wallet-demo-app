import { renderHook } from '@testing-library/react'

import { useLayoutStore } from './index'

describe('LayoutStore', () => {
  it('creates an layout store with initial state "mobile"', () => {
    const store = renderHook(() => useLayoutStore()).result.current

    expect(store.layout).toBe('mobile')
  })
})
