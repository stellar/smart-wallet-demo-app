import { featureFlagFactory } from 'api/core/entities/feature-flag/factory'
import { mockFeatureFlagRepository } from 'api/core/services/feature-flag/mock'

import { CreateFeatureFlag, endpoint } from './index'

const mockedFeatureFlagsRepository = mockFeatureFlagRepository()

const mockedPayload = {
  name: 'New Feature',
  is_active: true,
}

const newFeatureFlag = featureFlagFactory({
  name: mockedPayload.name,
  isActive: mockedPayload.is_active,
})

let useCase: CreateFeatureFlag

describe('CreateFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateFeatureFlag(mockedFeatureFlagsRepository)
  })

  it('should create a feature flag', async () => {
    mockedFeatureFlagsRepository.createFeatureFlag.mockResolvedValue(newFeatureFlag)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.flag).toEqual(useCase.parseResponseFlag(newFeatureFlag))
    expect(result.message).toBe('Feature flag created successfully')
  })

  it('should create a feature flag with optional fields', async () => {
    const payloadWithOptionalFields = {
      ...mockedPayload,
      description: 'An updated description',
      metadata: { additionalKey: 'additionalValue' },
    }

    const optionalFieldsFeatureFlag = featureFlagFactory({
      ...newFeatureFlag,
      description: payloadWithOptionalFields.description,
      metadata: payloadWithOptionalFields.metadata,
    })

    mockedFeatureFlagsRepository.createFeatureFlag.mockResolvedValue(optionalFieldsFeatureFlag)
    const result = await useCase.handle(payloadWithOptionalFields)

    expect(result.data.flag).toEqual(useCase.parseResponseFlag(optionalFieldsFeatureFlag))
    expect(result.message).toBe('Feature flag created successfully')
  })

  it('should parse feature flag correctly', () => {
    const result = useCase.parseResponseFlag(newFeatureFlag)
    expect(result).toEqual({
      name: newFeatureFlag.name,
      is_active: newFeatureFlag.isActive,
      description: newFeatureFlag.description,
      metadata: newFeatureFlag.metadata,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
