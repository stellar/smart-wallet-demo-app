import { Mocked } from 'vitest'

import { NftRepositoryType } from 'api/core/entities/nft/types'

export function mockNftRepository(): Mocked<NftRepositoryType> {
  return {
    getNftById: vi.fn(),
    getNftByTokenId: vi.fn(),
    getNftBySessionId: vi.fn(),
    getNftByUserAndSessionId: vi.fn(),
    getNftByContractAddress: vi.fn(),
    getNftByTokenIdAndContractAddress: vi.fn(),
    createNft: vi.fn(),
    updateNft: vi.fn(),
    deleteNfts: vi.fn(),
    saveNfts: vi.fn(),
    getLeaderboard: vi.fn(),
  }
}
