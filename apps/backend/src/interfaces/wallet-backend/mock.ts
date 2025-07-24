import { Mocked } from 'vitest'

import { WalletBackendType } from './types'

export function mockWalletBackend(): Mocked<WalletBackendType> {
  return {
    registerAccount: vi.fn(),
    deregisterAccount: vi.fn(),
    getPayments: vi.fn(),
    buildTransaction: vi.fn(),
    createFeeBumpTransaction: vi.fn(),
  }
}
