import { featureFlagFactory } from './factory'

describe('Feature Flag factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedFeatureFlag = featureFlagFactory({})

    expect(mockedFeatureFlag.featureFlagId).not.toBeUndefined()
    expect(mockedFeatureFlag.name).not.toBeUndefined()
    expect(mockedFeatureFlag.isActive).not.toBeUndefined()
    expect(mockedFeatureFlag.description).not.toBeUndefined()
    expect(mockedFeatureFlag.metadata).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedFeatureFlag = featureFlagFactory({
      featureFlagId: 'abc123',
      name: 'Show Feature',
      isActive: true,
      description: 'A feature to show something',
    })

    expect(mockedFeatureFlag.featureFlagId).toBe('abc123')
    expect(mockedFeatureFlag.name).toBe('Show Feature')
    expect(mockedFeatureFlag.isActive).toBe(true)
    expect(mockedFeatureFlag.description).toBe('A feature to show something')
    expect(mockedFeatureFlag.metadata).toEqual({})
  })
})
