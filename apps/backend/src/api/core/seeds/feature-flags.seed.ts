import { DataSource } from 'typeorm'

import { FeatureFlag } from 'api/core/entities/feature-flag/model'
import { BaseSeed } from 'api/core/framework/orm/base-seed'
import { logger } from 'config/logger'

const featureFlags = [
  {
    name: 'airdrop',
    isActive: false,
    description:
      'When enabled, displays the airdrop banner at wallet home page for users eligible to receive the airdrop.',
  },
  {
    name: 'behind-scenes',
    isActive: false,
    description: 'When enabled, shows the "Behind the Scenes" banner at wallet home page.',
  },
  {
    name: 'coming-soon',
    isActive: false,
    description:
      'When enabled, displays the Coming Soon page for non-authenticated users, blocking them to access the wallet.',
  },
  {
    name: 'left-swags',
    isActive: false,
    description: 'When enabled, shows the Left Swags banner at wallet home page.',
  },
  {
    name: 'transfer-left-assets',
    isActive: false,
    description:
      'When enabled, shows the Transfer Left Assets banner and unlocks the left-assets page; users can transfer their remaining assets to external wallets.',
  },
  {
    name: 'wallet-coming-soon',
    isActive: false,
    description: 'When enabled, displays the Wallet Coming Soon banner at wallet home page.',
  },
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
