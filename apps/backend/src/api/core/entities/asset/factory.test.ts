import { assetFactory } from './factory'

describe('Asset factory tests', () => {
  it('Should fill in random values', async () => {
    const mockedUser = assetFactory({})

    expect(mockedUser.assetId).not.toBeUndefined()
    expect(mockedUser.name).not.toBeUndefined()
    expect(mockedUser.type).not.toBeUndefined()
    expect(mockedUser.code).not.toBeUndefined()
    expect(mockedUser.contractAddress).not.toBeUndefined()
  })

  it('Should fill in custom values', async () => {
    const mockedUser = assetFactory({
      assetId: 'abc123',
      name: 'Stellar',
      type: 'native',
      code: 'XLM',
      contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    })

    expect(mockedUser.assetId).toBe('abc123')
    expect(mockedUser.name).toBe('Stellar')
    expect(mockedUser.type).toBe('native')
    expect(mockedUser.code).toBe('XLM')
    expect(mockedUser.contractAddress).toBe('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC')
  })
})
