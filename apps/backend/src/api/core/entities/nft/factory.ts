import { faker } from '@faker-js/faker'

import { Nft } from 'api/core/entities/nft/model'

import { userFactory } from '../user/factory'
import { User } from '../user/types'

interface NftFactoryArgs {
  nftId?: string
  tokenId?: string
  contractAddress?: string
  user?: User
}

export const nftFactory = ({ nftId, tokenId, contractAddress, user }: NftFactoryArgs): Nft => {
  const nft = new Nft()
  nft.nftId = nftId ?? faker.string.uuid()
  nft.tokenId = tokenId ?? faker.string.numeric({ length: { min: 1, max: 6 }, allowLeadingZeros: false })
  nft.contractAddress = contractAddress ?? faker.string.alphanumeric({ casing: 'upper', length: 56 })
  nft.user = user ?? userFactory({})
  return nft
}