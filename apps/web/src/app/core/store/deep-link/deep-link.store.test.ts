import { renderHook } from '@testing-library/react'

import { useDeepLinkStore } from '.'

describe('DeepLinkStore', () => {
  it('creates an deep link store with initial state empty', () => {
    const store = renderHook(() => useDeepLinkStore()).result.current

    expect(store.deepLink).toBeNull()
  })
})
