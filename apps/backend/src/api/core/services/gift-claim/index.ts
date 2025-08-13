import { Repository } from 'typeorm'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { sha256Hash } from 'api/core/utils/crypto'
import { AppDataSource } from 'config/database'
import { logger } from 'config/logger'

import { GiftClaim } from '../../entities/gift-claim/model'
import { GiftReservationRepositoryType } from '../../entities/gift-claim/types'
import { User } from '../../entities/user/model'

export default class GiftReservationRepository extends SingletonBase implements GiftReservationRepositoryType {
  private repository: Repository<GiftClaim> = AppDataSource.getRepository(GiftClaim)
  private userRepository: Repository<User> = AppDataSource.getRepository(User)

  constructor() {
    super()
  }

  async reserveGift(giftId: string, walletAddress: string): Promise<GiftClaim | null> {
    const giftIdHash = sha256Hash(giftId)

    const user = await this.userRepository.findOne({ where: { contractAddress: walletAddress } })
    if (!user) {
      logger.warn({ giftIdHash, walletAddress }, 'User not found for wallet address')
      return null
    }

    const existingClaim = await this.repository.findOne({
      where: { giftIdHash },
      relations: ['user'],
    })

    if (existingClaim) {
      if (existingClaim.user.contractAddress !== walletAddress) {
        logger.warn(
          { giftIdHash, existingAddress: existingClaim.user.contractAddress, requestedAddress: walletAddress },
          'Gift already claimed by different wallet address'
        )
        return null
      }

      return existingClaim
    }

    const giftClaim = this.repository.create({
      giftIdHash,
      user,
    })

    return this.repository.save(giftClaim)
  }
}
