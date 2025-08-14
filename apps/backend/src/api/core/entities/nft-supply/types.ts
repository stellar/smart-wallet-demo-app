import { DeleteResult } from 'typeorm'

import { NftSupply as NftSupplyModel } from 'api/core/entities/nft-supply/model'

export type NftSupply = NftSupplyModel

export type NftSupplyRepositoryType = {
  getNftSupplyById(nftSupplyId: string): Promise<NftSupply | null>
  getNftSupplyByContractAddress(contractAddress: string): Promise<NftSupply | null>
  getNftSupplyBySessionId(session_id: string): Promise<NftSupply | null>
  getNftSupplyByResource(resource: string): Promise<NftSupply | null>
  createNftSupply(
    nftSupply: {
      name: string
      description: string
      url: string
      code: string
      contractAddress: string
      sessionId: string
      resource: string
      totalSupply?: number
      mintedAmount?: number
      issuer?: string
    },
    save?: boolean
  ): Promise<NftSupply>
  updateNftSupply(nftId: string, data: Partial<NftSupply>): Promise<NftSupply>
  deleteNftSupply(nftId: string): Promise<DeleteResult>
  saveNftSupply(nft: NftSupply): Promise<NftSupply>
}
