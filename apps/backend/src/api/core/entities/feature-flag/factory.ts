import { faker } from '@faker-js/faker'

import { FeatureFlag } from 'api/core/entities/feature-flag/model'

interface FeatureFlagArgs {
  featureFlagId?: string
  name?: string
  isActive?: boolean
  description?: string
  metadata?: object
}

export const featureFlagFactory = ({
  featureFlagId,
  name,
  isActive,
  description,
  metadata,
}: FeatureFlagArgs): FeatureFlag => {
  const featureFlag = new FeatureFlag()
  featureFlag.featureFlagId = featureFlagId ?? faker.string.uuid()
  featureFlag.name = name ?? faker.lorem.word()
  featureFlag.isActive = isActive ?? faker.datatype.boolean()
  featureFlag.description = description ?? faker.lorem.sentence()
  featureFlag.metadata = metadata ?? {}
  return featureFlag
}
