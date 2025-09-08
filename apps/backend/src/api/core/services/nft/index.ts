import { DeleteResult, ILike } from 'typeorm'

import { Nft as NftModel } from 'api/core/entities/nft/model'
import { Nft, NftRepositoryType } from 'api/core/entities/nft/types'
import { NftSupply } from 'api/core/entities/nft-supply/types'
import { User } from 'api/core/entities/user/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AppDataSource } from 'config/database'

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
      .andWhere('nft.contractAddress ILIKE :contractAddress', { contractAddress })
      .getOne()
  }

  async getNftBySessionId(sessionId: string): Promise<Nft | null> {
    return NftModel.createQueryBuilder('nft')
      .leftJoinAndSelect('nft.nftSupply', 'nftSupply')
      .where('nftSupply.sessionId = :sessionId', { sessionId })
      .getOne()
  }

  async getNftByUserAndSessionId(
    userId: string,
    sessionId: string,
    options?: { includeDeleted?: boolean }
  ): Promise<Nft | null> {
    const qb = NftModel.createQueryBuilder('nft')
      .leftJoinAndSelect('nft.nftSupply', 'nftSupply')
      .where('nftSupply.sessionId = :sessionId', { sessionId })
      .andWhere('nft.user = :userId', { userId })

    if (options?.includeDeleted) {
      qb.withDeleted()
    } else {
      qb.andWhere('nft.deletedAt IS NULL')
    }

    return qb.getOne()
  }

  async getNftByContractAddress(contractAddress: string): Promise<Nft | null> {
    return NftModel.findOneBy({ contractAddress: ILike(contractAddress) })
  }

  async getLeaderboard(): Promise<{ user: User; nftCount: number }[]> {
    return NftModel.createQueryBuilder('nft')
      .select('user.userId', 'userId')
      .addSelect('user.email', 'email')
      .addSelect('user.contractAddress', 'contractAddress')
      .addSelect('COUNT(nft.nftId)', 'nftCount')
      .leftJoin('nft.user', 'user')
      .where('nft.deletedAt IS NULL')
      .groupBy('user.userId, user.email, user.contractAddress')
      .orderBy('COUNT(nft.nftId)', 'DESC')
      .getRawMany()
      .then(results =>
        results.map(result => ({
          user: {
            userId: result.userId,
            email: result.email,
            contractAddress: result.contractAddress,
          } as User,
          nftCount: parseInt(result.nftCount),
        }))
      )
  }

  async createNft(
    nft: { tokenId?: string; contractAddress: string; nftSupply?: NftSupply; transactionHash?: string; user: User },
    save?: boolean
  ): Promise<Nft> {
    const newNft = NftModel.create({ ...nft })
    if (save) {
      return (await this.saveNfts([newNft]))[0]
    }
    return newNft
  }

  async updateNft(nftId: string, data: Partial<Nft>): Promise<Nft> {
    await NftModel.update(nftId, data)
    return this.getNftById(nftId) as Promise<Nft>
  }

  async deleteNfts(ids: string[], options?: { soft?: boolean }): Promise<DeleteResult> {
    if (options?.soft) {
      return AppDataSource.getRepository(NftModel).softDelete(ids)
    } else {
      return NftModel.delete(ids)
    }
  }

  saveNfts(nfts: Nft[]): Promise<Nft[]> {
    return NftModel.save(nfts)
  }
}
