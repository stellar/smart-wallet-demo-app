import { Mocked } from 'vitest'

import { NftRepositoryType } from 'api/core/entities/nft/types'

export function mockNftRepository(): Mocked<NftRepositoryType> {
  return {
    getNftById: vi.fn(),
    getNftByTokenId: vi.fn(),
    getNftByContractAddress: vi.fn(),
    createNft: vi.fn(),
    updateNft: vi.fn(),
    deleteNft: vi.fn(),
    saveNft: vi.fn(),
  }
}
