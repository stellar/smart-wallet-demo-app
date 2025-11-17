import { renderHook } from '@testing-library/react'

import { useAccessTokenStore } from '../access-token'

describe('AccessTokenStore', () => {
  it('creates an access token store with initial state empty', () => {
    const store = renderHook(() => useAccessTokenStore()).result.current

    expect(store.accessToken).toBeNull()
  })
})
