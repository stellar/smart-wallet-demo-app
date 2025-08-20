import { assetFactory } from 'api/core/entities/asset/factory'
import { mockAssetRepository } from 'api/core/services/asset/mock'

import { CreateAsset, endpoint } from './index'

const mockedAssetRepository = mockAssetRepository()

const mockedPayload = {
  name: 'Stellar Lumen',
  code: 'XLM',
  type: 'native',
  contract_address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
}

const newAsset = assetFactory({
  name: mockedPayload.name,
  code: mockedPayload.code,
  type: mockedPayload.type,
  contractAddress: mockedPayload.contract_address,
})

let useCase: CreateAsset

describe('CreateAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateAsset(mockedAssetRepository)
  })

  it('should create an asset', async () => {
    mockedAssetRepository.createAsset.mockResolvedValue(newAsset)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.asset).toEqual(useCase.parseResponseAsset(newAsset))
    expect(result.message).toBe('Asset created successfully')
  })

  it('should parse asset correctly', () => {
    const result = useCase.parseResponseAsset(newAsset)
    expect(result).toEqual({
      name: newAsset.name,
      code: newAsset.code,
      type: newAsset.type,
      contract_address: newAsset.contractAddress,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
