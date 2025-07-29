import { Vendor as VendorModel } from 'api/core/entities/vendor/model'
import { Vendor, VendorRepositoryType } from 'api/core/entities/vendor/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class VendorRepository extends SingletonBase implements VendorRepositoryType {
  constructor() {
    super()
  }

  async getVendorById(vendorId: string): Promise<Vendor | null> {
    return VendorModel.findOneBy({ vendorId })
  }

  async getVendorByContractAddress(contractAddress: string): Promise<Vendor | null> {
    return VendorModel.findOneBy({ contractAddress })
  }

  async createVendor(
    vendor: { name: string; contractAddress?: string; profileImage?: string },
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
