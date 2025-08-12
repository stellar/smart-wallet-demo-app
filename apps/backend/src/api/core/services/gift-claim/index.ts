import { Repository } from 'typeorm'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { sha256Hash } from 'api/core/utils/crypto'
import { AppDataSource } from 'config/database'
import { logger } from 'config/logger'

import { GiftClaim } from '../../entities/gift-claim/model'
import { GiftReservationRepositoryType } from '../../entities/gift-claim/types'

export default class GiftReservationRepository extends SingletonBase implements GiftReservationRepositoryType {
  private repository: Repository<GiftClaim> = AppDataSource.getRepository(GiftClaim)

  constructor() {
    super()
  }

  async reserveGift(giftId: string, walletAddress: string): Promise<GiftClaim | null> {
    const giftIdHash = sha256Hash(giftId)

    const existingClaim = await this.repository.findOne({ where: { giftIdHash } })

    if (existingClaim) {
      if (existingClaim.walletAddress !== walletAddress) {
        logger.warn(
          { giftIdHash, existingAddress: existingClaim.walletAddress, requestedAddress: walletAddress },
          'Gift already claimed by different wallet address'
        )
        return null
      }

      return existingClaim
    }

    const giftClaim = this.repository.create({
      giftIdHash,
      walletAddress,
    })

    return this.repository.save(giftClaim)
  }
}
