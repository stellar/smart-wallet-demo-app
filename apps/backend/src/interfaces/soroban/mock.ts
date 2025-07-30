import { Mocked } from 'vitest'

import { ISorobanService } from './types'

export function mockSorobanService(): Mocked<ISorobanService> {
  return {
    signAuthEntry: vi.fn(),
    signAuthEntries: vi.fn(),
    generateWebAuthnChallengeFromContract: vi.fn(),
    simulateContract: vi.fn(),
    sendTransaction: vi.fn(),
  }
}
