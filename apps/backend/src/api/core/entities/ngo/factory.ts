import { faker } from '@faker-js/faker'

import { Ngo } from 'api/core/entities/ngo/model'

interface NgoFactoryArgs {
  ngoId?: string
  name?: string
  description?: string
  walletAddress?: string
  profileImage?: string
}

export const ngoFactory = ({ ngoId, name, description, profileImage, walletAddress }: NgoFactoryArgs): Ngo => {
  const ngo = new Ngo()
  ngo.ngoId = ngoId ?? faker.string.uuid()
  ngo.name = name ?? 'NGO Name'
  ngo.description = description ?? 'NGO descriptiion'
  ngo.profileImage = profileImage ?? 'some/path/to/image.png'
  ngo.walletAddress = walletAddress ?? 'FAKE_CONTRACT_ADDRESS'
  return ngo
}
