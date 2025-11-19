import { FindManyOptions, FindOneOptions, ILike } from 'typeorm'

import { Vendor as VendorModel } from 'api/core/entities/vendor/model'
import { Vendor, VendorRepositoryType } from 'api/core/entities/vendor/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class VendorRepository extends SingletonBase implements VendorRepositoryType {
  constructor() {
    super()
  }

  async getVendors(options?: FindManyOptions<Vendor>): Promise<Vendor[]> {
    return VendorModel.find(options ?? {})
  }

  async getVendorById(vendorId: string): Promise<Vendor | null> {
    return VendorModel.findOneBy({ vendorId })
  }

  async getVendorByWalletAddress(walletAddress: string, options?: FindOneOptions<Vendor>): Promise<Vendor | null> {
    return VendorModel.findOne({ where: { walletAddress: ILike(walletAddress) }, ...options })
  }

  async createVendor(
    vendor: {
      name: string
      description?: string
      isActive?: boolean
      displayOrder?: number
      walletAddress?: string
      profileImage?: string
    },
    save?: boolean
  ): Promise<Vendor> {
    const newVendor = VendorModel.create({ ...vendor })
    if (save) {
      return this.saveVendor(newVendor)
    }
    return newVendor
  }

  async updateVendor(vendorId: string, data: Partial<Vendor>): Promise<Vendor> {
    await VendorModel.update(vendorId, data)
    return this.getVendorById(vendorId) as Promise<Vendor>
  }

  async saveVendor(vendor: Vendor): Promise<Vendor> {
    return VendorModel.save(vendor)
  }
}
