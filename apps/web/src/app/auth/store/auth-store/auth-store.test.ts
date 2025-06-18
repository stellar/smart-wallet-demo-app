import { renderHook } from '@testing-library/react'

import { useAuthStore } from '.'

describe('AuthStore', () => {
  it('creates an auth store with initial state empty', () => {
    const store = renderHook(() => useAuthStore()).result.current

    expect(store.currentUser).toBeUndefined()
  })
})
