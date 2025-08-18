import { Mocked } from 'vitest'

import { NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'

export function mockNftRepository(): Mocked<NftSupplyRepositoryType> {
  return {
    getNftSupplyById: vi.fn(),
    getNftSupplyByContractAddress: vi.fn(),
    getNftSupplyBySessionId: vi.fn(),
    getNftSupplyByResource: vi.fn(),
    getNftSupplyByResourceAndSessionId: vi.fn(),
    getNftSupplyByContractAndSessionId: vi.fn(),
    createNftSupply: vi.fn(),
    updateNftSupply: vi.fn(),
    deleteNftSupply: vi.fn(),
    saveNftSupply: vi.fn(),
    incrementMintedAmount: vi.fn(),
  }
}
