import { renderHook } from '@testing-library/react'

import { useEmailStore } from '../email'

describe('EmailStore', () => {
  it('creates an email store with initial state empty', () => {
    const store = renderHook(() => useEmailStore()).result.current

    expect(store.email).toBeNull()
  })
})
