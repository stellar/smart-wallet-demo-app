import { featureFlagFactory } from 'api/core/entities/feature-flag/factory'
import { mockFeatureFlagRepository } from 'api/core/services/feature-flag/mock'

import { GetFeatureFlags, endpoint } from './index'

const mockedFeatureFlagsRepository = mockFeatureFlagRepository()

const featureFlag1 = featureFlagFactory({})
const featureFlag2 = featureFlagFactory({})

let useCase: GetFeatureFlags

describe('GetFeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetFeatureFlags(mockedFeatureFlagsRepository)
  })

  it('should return feature flags', async () => {
    mockedFeatureFlagsRepository.getFeatureFlags.mockResolvedValue([featureFlag1, featureFlag2])
    const result = await useCase.handle()

    expect(result.data.flags).toEqual(useCase.parseResponseFlags([featureFlag1, featureFlag2]))
    expect(result.message).toBe('Retrieved feature flags successfully')
  })

  it('should return feature flags - empty case', async () => {
    mockedFeatureFlagsRepository.getFeatureFlags.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.flags).toEqual([])
    expect(result.message).toBe('Retrieved feature flags successfully')
  })

  it('should parse feature flags correctly', async () => {
    const parsedFlags = useCase.parseResponseFlags([featureFlag1, featureFlag2])

    expect(parsedFlags).toEqual([
      {
        id: featureFlag1.featureFlagId,
        name: featureFlag1.name,
        is_active: featureFlag1.isActive,
        description: featureFlag1.description,
        metadata: featureFlag1.metadata,
      },
      {
        id: featureFlag2.featureFlagId,
        name: featureFlag2.name,
        is_active: featureFlag2.isActive,
        description: featureFlag2.description,
        metadata: featureFlag2.metadata,
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
