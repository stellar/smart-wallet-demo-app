import { FeatureFlag as FeatureFlagModel } from 'api/core/entities/feature-flag/model'

export type FeatureFlag = FeatureFlagModel

export type FeatureFlagRepositoryType = {
  getFeatureFlags(): Promise<FeatureFlag[]>
  getFeatureFlagById(featureFlagId: string): Promise<FeatureFlag | null>
  createFeatureFlag(
    featureFlag: { name: string; isActive?: boolean; description?: string; metadata?: object },
    save?: boolean
  ): Promise<FeatureFlag>
  updateFeatureFlag(featureFlagId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag>
  saveFeatureFlag(featureFlag: FeatureFlag): Promise<FeatureFlag>
}
