import { assetFactory } from 'api/core/entities/asset/factory'
import { Asset } from 'api/core/entities/asset/types'
import { mockAssetRepository } from 'api/core/services/asset/mock'

import { UpdateAsset, endpoint } from './index'

const mockedAssetRepository = mockAssetRepository()

const mockedAsset = assetFactory({
  name: 'New Asset',
  code: 'NAS',
  type: 'token',
  contractAddress: 'CDLZFC3SYJYDZT7K67VABC123456ZVNIXF47ZG2FB2RMQQVU2HHGCYSC',
})

let useCase: UpdateAsset

describe('UpdateAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateAsset(mockedAssetRepository)
  })

  it('should update an asset', async () => {
    const updatedAsset = {
      ...mockedAsset,
      name: 'Updated Asset',
    } as Asset

    mockedAssetRepository.updateAsset.mockResolvedValue(updatedAsset)
    const result = await useCase.handle({ id: mockedAsset.assetId, name: 'Updated Asset' })

    expect(result.data.asset).toEqual(useCase.parseResponseAsset(updatedAsset))
    expect(result.message).toBe('Asset updated successfully')
  })

  it('should parse an asset correctly', () => {
    const result = useCase.parseResponseAsset(mockedAsset)
    expect(result).toEqual({
      name: mockedAsset.name,
      code: mockedAsset.code,
      type: mockedAsset.type,
      contract_address: mockedAsset.contractAddress,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
