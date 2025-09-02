import { Mocked } from 'vitest'

import { NgoRepositoryType } from 'api/core/entities/ngo/types'

export function mockNgoRepository(): Mocked<NgoRepositoryType> {
  return {
    getNgos: vi.fn(),
    getNgoById: vi.fn(),
    getNgoByWalletAddress: vi.fn(),
    createNgo: vi.fn(),
    updateNgo: vi.fn(),
    saveNgo: vi.fn(),
  }
}
