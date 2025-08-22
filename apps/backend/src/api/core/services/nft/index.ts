import { DeleteResult } from 'typeorm'

import { Nft as NftModel } from 'api/core/entities/nft/model'
import { Nft, NftRepositoryType } from 'api/core/entities/nft/types'
import { NftSupply } from 'api/core/entities/nft-supply/types'
import { User } from 'api/core/entities/user/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class NftRepository extends SingletonBase implements NftRepositoryType {
  constructor() {
    super()
  }

  async getNftById(nftId: string): Promise<Nft | null> {
    return NftModel.findOneBy({ nftId })
  }

  async getNftByTokenId(tokenId: string): Promise<Nft | null> {
    return NftModel.findOneBy({ tokenId })
  }

  async getNftByTokenIdAndContractAddress(tokenId: string, contractAddress: string): Promise<Nft | null> {
    return NftModel.createQueryBuilder('nft')
      .where('nft.tokenId = :tokenId', { tokenId })
      .andWhere('nft.contractAddress = :contractAddress', { contractAddress })
      .getOne()
  }

  async getNftBySessionId(sessionId: string): Promise<Nft | null> {
    return NftModel.createQueryBuilder('nft')
      .leftJoinAndSelect('nft.nftSupply', 'nftSupply')
      .where('nftSupply.sessionId = :sessionId', { sessionId })
      .getOne()
  }

  async getNftByUserIdSessionId(userId: string, sessionId: string): Promise<Nft | null> {
    return NftModel.createQueryBuilder('nft')
      .leftJoinAndSelect('nft.nftSupply', 'nftSupply')
      .where('nftSupply.sessionId = :sessionId', { sessionId })
      .andWhere('nft.user = :userId', { userId })
      .getOne()
  }

  async getNftByContractAddress(contractAddress: string): Promise<Nft | null> {
    return NftModel.findOneBy({ contractAddress })
  }

  async createNft(
    nft: { tokenId?: string; contractAddress: string; nftSupply?: NftSupply; transactionHash?: string; user: User },
    save?: boolean
  ): Promise<Nft> {
    const newNft = NftModel.create({ ...nft })
    if (save) {
      return this.saveNft(newNft)
    }
    return newNft
  }

  async updateNft(nftId: string, data: Partial<Nft>): Promise<Nft> {
    await NftModel.update(nftId, data)
    return this.getNftById(nftId) as Promise<Nft>
  }

  async deleteNft(id: string): Promise<DeleteResult> {
    return NftModel.delete(id)
  }

  saveNft(nft: Nft): Promise<Nft> {
    return NftModel.save(nft)
  }
}
