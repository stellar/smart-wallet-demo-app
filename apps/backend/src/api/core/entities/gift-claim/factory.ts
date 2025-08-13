import { faker } from '@faker-js/faker'

import { sha256Hash } from 'api/core/utils/crypto'
import { randomContractAddress } from 'test-utils'

import { GiftClaim } from './model'
import { userFactory } from '../user/factory'
import { User } from '../user/model'

interface GiftClaimFactoryArgs {
  giftIdHash?: string
  user?: User
  contractAddress?: string
  createdAt?: Date
  updatedAt?: Date
}

export const giftClaimFactory = ({
  giftIdHash,
  user,
  contractAddress,
  createdAt,
  updatedAt,
}: GiftClaimFactoryArgs = {}): GiftClaim => {
  const giftClaim = new GiftClaim()

  giftClaim.giftIdHash = giftIdHash ?? sha256Hash(faker.string.uuid())
  giftClaim.user = user ?? userFactory({ contractAddress: contractAddress ?? randomContractAddress() })
  giftClaim.createdAt = createdAt ?? faker.date.past()
  giftClaim.updatedAt = updatedAt ?? faker.date.recent()

  return giftClaim
}
