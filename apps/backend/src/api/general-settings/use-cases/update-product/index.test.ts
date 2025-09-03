import { productFactory } from 'api/core/entities/product/factory'
import { Product } from 'api/core/entities/product/types'
import { mockProductRepository } from 'api/core/services/product/mocks'

import { UpdateProduct, endpoint } from './index'

const mockedProductRepository = mockProductRepository()

const mockedProduct = productFactory({
  name: 'New Product',
  code: 'NPRD',
  description: 'A new product',
  isSwag: false,
  isHidden: false,
})

let useCase: UpdateProduct

describe('UpdateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new UpdateProduct(mockedProductRepository)
  })

  it('should update a product', async () => {
    const updatedProduct = {
      ...mockedProduct,
      name: 'Updated Product',
    } as Product

    mockedProductRepository.updateProduct.mockResolvedValue(updatedProduct)
    const result = await useCase.handle({ id: mockedProduct.productId, name: 'Updated Product' })

    expect(result.data.product).toEqual(useCase.parseResponseProduct(updatedProduct))
    expect(result.message).toBe('Product updated successfully')
  })

  it('should parse a product correctly', () => {
    const result = useCase.parseResponseProduct(mockedProduct)
    expect(result).toEqual({
      id: mockedProduct.productId,
      code: mockedProduct.code,
      name: mockedProduct.name,
      image_url: mockedProduct.imageUrl,
      description: mockedProduct.description,
      is_swag: mockedProduct.isSwag,
      is_hidden: mockedProduct.isHidden,
      asset: {
        id: mockedProduct.asset?.assetId,
        name: mockedProduct.asset?.name,
        code: mockedProduct.asset?.code,
        type: mockedProduct.asset?.type,
        contract_address: mockedProduct.asset?.contractAddress,
      },
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/:id')
  })
})
