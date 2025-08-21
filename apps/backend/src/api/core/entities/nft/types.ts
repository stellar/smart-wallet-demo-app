import { DeleteResult } from 'typeorm'

import { Nft as NftModel } from 'api/core/entities/nft/model'
import { NftSupply } from 'api/core/entities/nft-supply/types'

import { User } from '../user/types'

export type Nft = NftModel

export type NftRepositoryType = {
  getNftById(nftId: string): Promise<Nft | null>
  getNftByTokenId(tokenId: string): Promise<Nft | null>
  getNftBySessionId(sessionId: string): Promise<Nft | null>
  getNftByContractAddress(contractAddress: string): Promise<Nft | null>
  getNftByTokenIdAndContractAddress(tokenId: string, contractAddress: string): Promise<Nft | null>
  createNft(
    nft: { tokenId: string; contractAddress: string; user: User; nftSupply: NftSupply },
    save?: boolean
  ): Promise<Nft>
  updateNft(nftId: string, data: Partial<Nft>): Promise<Nft>
  deleteNft(nftId: string): Promise<DeleteResult>
  saveNft(nft: Nft): Promise<Nft>
}
