import { faker } from '@faker-js/faker'

import { Vendor } from 'api/core/entities/vendor/model'

interface VendorFactoryArgs {
  vendorId?: string
  name?: string
  walletAddress?: string
  profileImage?: string
}

export const vendorFactory = ({ vendorId, name, profileImage, walletAddress }: VendorFactoryArgs): Vendor => {
  const vendor = new Vendor()
  vendor.vendorId = vendorId ?? faker.string.uuid()
  vendor.name = name ?? 'Token Name'
  vendor.profileImage = profileImage ?? 'some/path/to/image.png'
  vendor.walletAddress = walletAddress ?? 'FAKE_CONTRACT_ADDRESS'
  return vendor
}
