import { vi, Mocked } from 'vitest'

import { ProofRepositoryType } from '../../entities/proof/types'

export function mockProofRepository(): Mocked<ProofRepositoryType> {
  return {
    findByAddress: vi.fn(),
  }
}
