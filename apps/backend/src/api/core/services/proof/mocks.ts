import { vi, Mocked } from 'vitest'

import { ProofRepositoryType } from '../../entities/proof/types'

export function mockProofRepository(): Mocked<ProofRepositoryType> {
  return {
    findByAddressAndContract: vi.fn(),
    saveProofs: vi.fn(),
  }
}
