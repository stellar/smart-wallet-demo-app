import { Ngo as NgoModel } from 'api/core/entities/ngo/model'
import { Ngo, NgoRepositoryType } from 'api/core/entities/ngo/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class NgoRepository extends SingletonBase implements NgoRepositoryType {
  constructor() {
    super()
  }

  async getNgos(): Promise<Ngo[]> {
    return NgoModel.find()
  }

  async getNgoById(ngoId: string): Promise<Ngo | null> {
    return NgoModel.findOneBy({ ngoId })
  }

  async getNgoByWalletAddress(walletAddress: string): Promise<Ngo | null> {
    return NgoModel.findOneBy({ walletAddress })
  }

  async createNgo(
    ngo: { name: string; description: string; walletAddress?: string; profileImage?: string },
    save?: boolean
  ): Promise<Ngo> {
    const newNgo = NgoModel.create({ ...ngo })
    if (save) {
      return this.saveNgo(newNgo)
    }
    return newNgo
  }

  async updateNgo(ngoId: string, data: Partial<Ngo>): Promise<Ngo> {
    await NgoModel.update(ngoId, data)
    return this.getNgoById(ngoId) as Promise<Ngo>
  }

  async saveNgo(ngo: Ngo): Promise<Ngo> {
    return NgoModel.save(ngo)
  }
}
