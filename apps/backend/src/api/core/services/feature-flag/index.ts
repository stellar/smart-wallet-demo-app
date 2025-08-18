import { FeatureFlag as FeatureFlagModel } from 'api/core/entities/feature-flag/model'
import { FeatureFlag, FeatureFlagRepositoryType } from 'api/core/entities/feature-flag/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class FeatureFlagRepository extends SingletonBase implements FeatureFlagRepositoryType {
  constructor() {
    super()
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return FeatureFlagModel.find()
  }

  async getFeatureFlagById(featureFlagId: string): Promise<FeatureFlag | null> {
    return FeatureFlagModel.findOneBy({ featureFlagId })
  }

  async createFeatureFlag(
    featureFlag: { name: string; isActive?: boolean; description?: string; metadata?: object },
    save?: boolean
  ): Promise<FeatureFlag> {
    const newFeatureFlag = FeatureFlagModel.create({ ...featureFlag })
    if (save) {
      return this.saveFeatureFlag(newFeatureFlag)
    }
    return newFeatureFlag
  }

  async updateFeatureFlag(featureFlagId: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    await FeatureFlagModel.update(featureFlagId, data)
    return this.getFeatureFlagById(featureFlagId) as Promise<FeatureFlag>
  }

  async saveFeatureFlag(featureFlag: FeatureFlag): Promise<FeatureFlag> {
    return FeatureFlagModel.save(featureFlag)
  }
}
