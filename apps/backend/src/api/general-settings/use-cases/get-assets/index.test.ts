import { assetFactory } from 'api/core/entities/asset/factory'
import { mockAssetRepository } from 'api/core/services/asset/mock'

import { GetAssets, endpoint } from './index'

const mockedAssetRepository = mockAssetRepository()

const asset1 = assetFactory({})
const asset2 = assetFactory({})

let useCase: GetAssets

describe('GetAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetAssets(mockedAssetRepository)
  })

  it('should return assets', async () => {
    mockedAssetRepository.getAssets.mockResolvedValue([asset1, asset2])
    const result = await useCase.handle()

    expect(result.data.assets).toEqual(useCase.parseResponseAssets([asset1, asset2]))
    expect(result.message).toBe('Retrieved assets successfully')
  })

  it('should return assets - empty case', async () => {
    mockedAssetRepository.getAssets.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.assets).toEqual([])
    expect(result.message).toBe('Retrieved assets successfully')
  })

  it('should parse assets correctly', async () => {
    const parsedAssets = useCase.parseResponseAssets([asset1, asset2])

    expect(parsedAssets).toEqual([
      {
        id: asset1.assetId,
        name: asset1.name,
        code: asset1.code,
        type: asset1.type,
        contract_address: asset1.contractAddress,
      },
      {
        id: asset2.assetId,
        name: asset2.name,
        code: asset2.code,
        type: asset2.type,
        contract_address: asset2.contractAddress,
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
