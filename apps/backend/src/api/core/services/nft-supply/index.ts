import { DeleteResult } from 'typeorm'

import { NftSupply as NftSupplyModel } from 'api/core/entities/nft-supply/model'
import { NftSupply, NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { AppDataSource } from 'config/database'

export default class NftSupplyRepository extends SingletonBase implements NftSupplyRepositoryType {
  constructor() {
    super()
  }

  async getNftSupplyById(nftSupplyId: string): Promise<NftSupply | null> {
    return NftSupplyModel.findOneBy({ nftSupplyId })
  }

  async getNftSupplyByContractAddress(contractAddress: string): Promise<NftSupply | null> {
    return NftSupplyModel.findOneBy({ contractAddress })
  }

  async getNftSupplyBySessionId(sessionId: string): Promise<NftSupply | null> {
    return NftSupplyModel.findOneBy({ sessionId })
  }

  async getNftSupplyByResource(resource: string): Promise<NftSupply | null> {
    return NftSupplyModel.findOneBy({ resource })
  }

  async createNftSupply(
    nftSupply: {
      name: string
      description: string
      url: string
      code: string
      contractAddress: string
      sessionId: string
      resource: string
      totaSupply: number
    },
    save?: boolean
  ): Promise<NftSupply> {
    const newNftSupply = NftSupplyModel.create({ ...nftSupply })
    if (save) {
      return this.saveNftSupply(newNftSupply)
    }
    return newNftSupply
  }

  async updateNftSupply(id: string, data: Partial<NftSupply>): Promise<NftSupply> {
    await NftSupplyModel.update(id, data)
    return this.getNftSupplyById(id) as Promise<NftSupply>
  }

  async deleteNftSupply(id: string): Promise<DeleteResult> {
    return NftSupplyModel.delete(id)
  }

  saveNftSupply(nftSupply: NftSupply): Promise<NftSupply> {
    return NftSupplyModel.save(nftSupply)
  }

  async incrementMintedAmount(id: string, data: Partial<NftSupply> = {}): Promise<NftSupply> {
    const result = await AppDataSource.createQueryBuilder()
      .update(data)
      .set({ mintedAmount: () => `"mintedAmount" + 1` }) // atomic increment in Postgres
      .where('nft_supply_id = :id', { id })
      .returning('*') // returns the updated row(s)
      .execute()

    return result.raw[0] as NftSupply // Updated entity with new mintedAmount
  }
}
