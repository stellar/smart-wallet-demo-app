import { productFactory } from 'api/core/entities/product/factory'
import { Product } from 'api/core/entities/product/types'
import { mockProductRepository } from 'api/core/services/product/mocks'

import { CreateProduct, endpoint } from './index'

const mockedProductRepository = mockProductRepository()

const mockedPayload = {
  name: 'Product name',
  code: 'Product Code',
  description: 'this is a product description',
  is_swag: false,
  is_hidden: false,
}

const newProduct = productFactory({
  name: mockedPayload.name,
  code: mockedPayload.code,
  description: mockedPayload.description,
  isSwag: mockedPayload.is_swag,
  isHidden: mockedPayload.is_hidden,
})

let useCase: CreateProduct

describe('CreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CreateProduct(mockedProductRepository)
  })

  it('should create a product', async () => {
    mockedProductRepository.createProduct.mockResolvedValue(newProduct)
    const result = await useCase.handle(mockedPayload)

    expect(result.data.product).toEqual(useCase.parseResponseProduct(newProduct))
    expect(result.message).toBe('Product created successfully')
  })

  it('should create a product - swag', async () => {
    const newSwag = { ...newProduct, isSwag: true } as Product
    mockedProductRepository.createProduct.mockResolvedValue(newSwag)
    const result = await useCase.handle({ ...mockedPayload, is_swag: true })

    expect(result.data.product).toEqual(useCase.parseResponseProduct(newSwag))
    expect(result.message).toBe('Product created successfully')
  })

  it('should parse product correctly', () => {
    const result = useCase.parseResponseProduct(newProduct)
    expect(result).toEqual({
      code: newProduct.code,
      name: newProduct.name,
      image_url: newProduct.imageUrl,
      description: newProduct.description,
      is_swag: newProduct.isSwag,
      is_hidden: newProduct.isHidden,
      asset_id: newProduct.asset?.assetId,
    })
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
