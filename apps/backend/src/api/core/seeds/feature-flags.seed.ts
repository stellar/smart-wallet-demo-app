import { DataSource } from 'typeorm'

import { FeatureFlag } from 'api/core/entities/feature-flag/model'
import { BaseSeed } from 'api/core/framework/orm/base-seed'
import { logger } from 'config/logger'

const featureFlags = [
  { name: 'airdrop', isActive: false },
  { name: 'behind-scenes', isActive: false },
  { name: 'coming-soon', isActive: false },
  { name: 'left-swags', isActive: false },
  { name: 'transfer-left-assets', isActive: false },
  { name: 'wallet-coming-soon', isActive: false },
]

export class FeatureFlagsSeed extends BaseSeed {
  name: string = 'FeatureFlagsSeed'

  async run(dataSource: DataSource): Promise<void> {
    logger.info('Seeding feature flags')

    const featureFlagRepository = dataSource.getRepository(FeatureFlag)

    for (const flag of featureFlags) {
      // Check if feature flag already exists
      const existingFlag = await featureFlagRepository.findOne({
        where: { name: flag.name },
      })

      if (existingFlag) {
        logger.info(`⏩ Feature flag "${flag.name}" already exists with ID: ${existingFlag.featureFlagId}`)
        continue
      }

      // Create feature flag
      const newFlag = featureFlagRepository.create({
        name: flag.name,
        isActive: flag.isActive,
      })

      const savedFlag = await featureFlagRepository.save(newFlag)
      logger.info(
        `✅ Feature flag "${savedFlag.name}" created successfully with ID: ${savedFlag.featureFlagId} | isActive: ${savedFlag.isActive}`
      )
    }
  }
}
