import { featureFlagFactory } from 'api/core/entities/feature-flag/factory'
import { FeatureFlag } from 'api/core/entities/feature-flag/types'
import { mockFeatureFlagRepository } from 'api/core/services/feature-flag/mock'

import { UpdateFeatureFlag, endpoint } from './index'

const mockedFeatureFlagsRepository = mockFeatureFlagRepository()

const mockedFeatureFlag = featureFlagFactory({
  name: 'New Feature',
  isActive: true,
})

let useCase: UpdateFeatureFlag

describe('UpdateFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateFeatureFlag(mockedFeatureFlagsRepository)
  })

  it('should update a feature flag', async () => {
    const updatedFlag = {
      ...mockedFeatureFlag,
      name: 'Updated Feature',
    } as FeatureFlag

    mockedFeatureFlagsRepository.updateFeatureFlag.mockResolvedValue(updatedFlag)
    const result = await useCase.handle({ id: mockedFeatureFlag.featureFlagId, name: 'Updated Feature' })

    expect(result.data.flag).toEqual(useCase.parseResponseFlag(updatedFlag))
    expect(result.message).toBe('Feature flag updated successfully')
  })

  it('should parse feature flag correctly', () => {
    const result = useCase.parseResponseFlag(mockedFeatureFlag)
    expect(result).toEqual({
      name: mockedFeatureFlag.name,
      is_active: mockedFeatureFlag.isActive,
      description: mockedFeatureFlag.description,
      metadata: mockedFeatureFlag.metadata,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
