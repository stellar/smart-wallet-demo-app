import { faker } from '@faker-js/faker'

import { sha256Hash } from 'api/core/utils/crypto'
import { randomContractAddress } from 'test-utils'

import { GiftClaim } from './model'

interface GiftClaimFactoryArgs {
  giftIdHash?: string
  walletAddress?: string
  createdAt?: Date
  updatedAt?: Date
}

export const giftClaimFactory = ({
  giftIdHash,
  walletAddress,
  createdAt,
  updatedAt,
}: GiftClaimFactoryArgs = {}): GiftClaim => {
  const giftClaim = new GiftClaim()

  giftClaim.giftIdHash = giftIdHash ?? sha256Hash(faker.string.uuid())
  giftClaim.walletAddress = walletAddress ?? randomContractAddress()
  giftClaim.createdAt = createdAt ?? faker.date.past()
  giftClaim.updatedAt = updatedAt ?? faker.date.recent()

  return giftClaim
}
