import { Ngo as NgoModel } from 'api/core/entities/ngo/model'

export type Ngo = NgoModel

export type NgoRepositoryType = {
  getNgos(): Promise<Ngo[]>
  getNgoById(ngoId: string): Promise<Ngo | null>
  getNgoByWalletAddress(walletAddress: string): Promise<Ngo | null>
  createNgo(
    ngo: {
      name: string
      description: string
      walletAddress: string
      profileImage?: string
      isActive?: boolean
      displayOrder?: number
    },
    save?: boolean
  ): Promise<Ngo>
  updateNgo(ngoId: string, data: Partial<Ngo>): Promise<Ngo>
  saveNgo(ngo: Ngo): Promise<Ngo>
}
