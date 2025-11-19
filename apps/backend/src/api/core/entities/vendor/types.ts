import { FindManyOptions, FindOneOptions } from 'typeorm'

import { Vendor as VendorModel } from 'api/core/entities/vendor/model'

export type Vendor = VendorModel

export type VendorRepositoryType = {
  getVendors(options?: FindManyOptions<Vendor>): Promise<Vendor[]>
  getVendorById(vendorId: string): Promise<Vendor | null>
  getVendorByWalletAddress(walletAddress: string, options?: FindOneOptions<Vendor>): Promise<Vendor | null>
  createVendor(
    vendor: {
      name: string
      description?: string
      isActive?: boolean
      displayOrder?: number
      contractAddress?: string
      profileImage?: string
    },
    save?: boolean
  ): Promise<Vendor>
  updateVendor(vendorId: string, data: Partial<Vendor>): Promise<Vendor>
  saveVendor(vendor: Vendor): Promise<Vendor>
}
