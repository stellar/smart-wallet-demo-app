import { faker } from '@faker-js/faker'

import { User } from 'api/core/entities/user/model'
import { randomContractAddress } from 'test-utils'

import { GiftClaim } from '../gift-claim/model'
import { Nft } from '../nft/model'
import { Passkey } from '../passkey/types'
import { UserProduct } from '../user-product/types'

interface UserFactoryArgs {
  userId?: string
  email?: string
  uniqueToken?: string
  contractAddress?: string
  passkeys?: Passkey[]
  giftClaims?: GiftClaim[]
  userProducts?: UserProduct[]
  nfts?: Nft[]
}

export const userFactory = ({
  userId,
  email,
  uniqueToken,
  contractAddress,
  passkeys,
  giftClaims,
  userProducts,
  nfts,
}: UserFactoryArgs): User => {
  const user = new User()
  user.userId = userId ?? faker.string.uuid()
  user.email = email ?? faker.internet.email()
  user.uniqueToken = uniqueToken ?? faker.string.uuid()
  user.contractAddress = contractAddress ?? randomContractAddress()
  user.passkeys = passkeys ?? []
  user.giftClaims = giftClaims ?? []
  user.userProducts = userProducts ?? []
  user.nfts = nfts ?? []
  return user
}
