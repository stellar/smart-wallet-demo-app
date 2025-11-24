import { faker } from '@faker-js/faker'

import { Vendor } from 'api/core/entities/vendor/model'

interface VendorFactoryArgs {
  vendorId?: string
  name?: string
  marketingName?: string
  description?: string
  isActive?: boolean
  displayOrder?: number
  walletAddress?: string
  profileImage?: string
}

export const vendorFactory = ({
  vendorId,
  name,
  marketingName,
  description,
  isActive,
  displayOrder,
  walletAddress,
  profileImage,
}: VendorFactoryArgs): Vendor => {
  const vendor = new Vendor()
  vendor.vendorId = vendorId ?? faker.string.uuid()
  vendor.name = name ?? 'Vendor Name'
  vendor.marketingName = marketingName ?? 'Vendor Marketing Name'
  vendor.description = description ?? 'Vendor description'
  vendor.isActive = isActive ?? true
  vendor.displayOrder = displayOrder ?? 0
  vendor.walletAddress = walletAddress ?? 'FAKE_CONTRACT_ADDRESS'
  vendor.profileImage = profileImage ?? 'some/path/to/image.png'
  return vendor
}
