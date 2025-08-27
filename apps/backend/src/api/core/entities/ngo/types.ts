import { Ngo as NgoModel } from 'api/core/entities/ngo/model'

export type Ngo = NgoModel

export type NgoRepositoryType = {
  getNgos(): Promise<Ngo[]>
  getNgoById(vendorId: string): Promise<Ngo | null>
  getNgoByWalletAddress(walletAddress: string): Promise<Ngo | null>
  createNgo(
    ngo: { name: string; description: string; walletAddress: string; profileImage?: string },
    save?: boolean
  ): Promise<Ngo>
  updateNgo(vendorId: string, data: Partial<Ngo>): Promise<Ngo>
  saveNgo(vendor: Ngo): Promise<Ngo>
}
