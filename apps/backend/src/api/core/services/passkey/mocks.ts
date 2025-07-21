import { Mocked } from 'vitest'

import { PasskeyRepositoryType } from 'api/core/entities/passkey/types'

export function mockPasskeyRepository(): Mocked<PasskeyRepositoryType> {
  return {
    getPasskeyById: vi.fn(),
    createPasskey: vi.fn(),
    updatePasskey: vi.fn(),
    deletePasskey: vi.fn(),
    savePasskeys: vi.fn(),
  }
}
