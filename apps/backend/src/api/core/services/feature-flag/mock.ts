import { Mocked } from 'vitest'

import { FeatureFlagRepositoryType } from 'api/core/entities/feature-flag/types'

export function mockFeatureFlagRepository(): Mocked<FeatureFlagRepositoryType> {
  return {
    getFeatureFlags: vi.fn(),
    getFeatureFlagById: vi.fn(),
    createFeatureFlag: vi.fn(),
    updateFeatureFlag: vi.fn(),
    saveFeatureFlag: vi.fn(),
  }
}
