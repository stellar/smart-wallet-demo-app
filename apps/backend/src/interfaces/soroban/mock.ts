import { Mocked } from 'vitest'

import { ISorobanService } from './types'

export function mockSorobanService(): Mocked<ISorobanService> {
  return {
    signAuthEntry: vi.fn(),
    signAuthEntries: vi.fn(),
    generateWebAuthnChallenge: vi.fn(),
    simulateContractOperation: vi.fn(),
    simulateTransaction: vi.fn(),
    signTransactionWithSourceAccount: vi.fn(),
    sendTransaction: vi.fn(),
  }
}
