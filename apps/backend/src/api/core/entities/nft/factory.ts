import { faker } from '@faker-js/faker'

import { Nft } from 'api/core/entities/nft/model'

import { nftSupplyFactory } from '../nft-supply/factory'
import { NftSupply } from '../nft-supply/types'
import { userFactory } from '../user/factory'
import { User } from '../user/types'

interface NftFactoryArgs {
  nftId?: string
  tokenId?: string
  contractAddress?: string
  nftSupply?: NftSupply
  user?: User
}

export const nftFactory = ({ nftId, tokenId, contractAddress, nftSupply, user }: NftFactoryArgs): Nft => {
  const nft = new Nft()
  nft.nftId = nftId ?? faker.string.uuid()
  nft.tokenId = tokenId ?? faker.string.numeric({ length: { min: 1, max: 6 }, allowLeadingZeros: false })
  nft.contractAddress = contractAddress ?? faker.string.alphanumeric({ casing: 'upper', length: 56 })
  nft.nftSupply = nftSupply ?? nftSupplyFactory({})
  nft.user = user ?? userFactory({})
  return nft
}
