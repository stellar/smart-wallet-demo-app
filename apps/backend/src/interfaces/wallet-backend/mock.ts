import { Mocked } from 'vitest'

import { WalletBackendType } from './types'

export function mockWalletBackend(): Mocked<WalletBackendType> {
  return {
    registerAccount: vi.fn(),
    deregisterAccount: vi.fn(),
    getTransactions: vi.fn(),
    buildTransaction: vi.fn(),
    createFeeBumpTransaction: vi.fn(),
  }
}
