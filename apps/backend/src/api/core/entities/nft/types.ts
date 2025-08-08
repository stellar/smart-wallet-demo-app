import { DeleteResult } from 'typeorm'

import { Nft as NftModel } from 'api/core/entities/nft/model'

import { User } from '../user/types'

export type Nft = NftModel

export type NftRepositoryType = {
  getNftById(nftId: string): Promise<Nft | null>
  getNftByTokenId(tokenId: string): Promise<Nft | null>
  getNftByContractAddress(contractAddress: string): Promise<Nft | null>
  createNft(
    nft: { tokenId: string; contractAddress: string; user: User },
    save?: boolean
  ): Promise<Nft>
  updateNft(nftId: string, data: Partial<Nft>): Promise<Nft>
  deleteNft(nftId: string): Promise<DeleteResult>
  saveNft(nft: Nft): Promise<Nft>
}
