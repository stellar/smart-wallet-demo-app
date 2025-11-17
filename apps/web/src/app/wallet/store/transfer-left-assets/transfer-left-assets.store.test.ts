import { renderHook } from '@testing-library/react'

import { useTransferLeftAssetsStore } from '.'

describe('TransferLeftAssetsStore', () => {
  it('creates an transfer-left-assets store with initial state empty', () => {
    const store = renderHook(() => useTransferLeftAssetsStore()).result.current

    expect(store.isFirstOpen).toBeTruthy()
  })
})
