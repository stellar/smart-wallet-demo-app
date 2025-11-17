import { Vendor as VendorModel } from 'api/core/entities/vendor/model'

export type Vendor = VendorModel

export type VendorRepositoryType = {
  getVendors(): Promise<Vendor[]>
  getVendorById(vendorId: string): Promise<Vendor | null>
  getVendorByWalletAddress(walletAddress: string): Promise<Vendor | null>
  createVendor(
    vendor: { name: string; contractAddress?: string; profileImage?: string },
    save?: boolean
  ): Promise<Vendor>
  updateVendor(vendorId: string, data: Partial<Vendor>): Promise<Vendor>
  saveVendor(vendor: Vendor): Promise<Vendor>
}
