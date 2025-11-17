import { productFactory } from 'api/core/entities/product/factory'
import { mockProductRepository } from 'api/core/services/product/mocks'

import { GetProducts, endpoint } from './index'

const mockedProductRepository = mockProductRepository()

const product1 = productFactory({})
const product2 = productFactory({})

let useCase: GetProducts

describe('GetProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetProducts(mockedProductRepository)
  })

  it('should return products', async () => {
    mockedProductRepository.getProducts.mockResolvedValue([product1, product2])
    const result = await useCase.handle()

    expect(result.data.products).toEqual(useCase.parseResponseProducts([product1, product2]))
    expect(result.message).toBe('Retrieved products successfully')
  })

  it('should return products - empty case', async () => {
    mockedProductRepository.getProducts.mockResolvedValue([])
    const result = await useCase.handle()

    expect(result.data.products).toEqual([])
    expect(result.message).toBe('Retrieved products successfully')
  })

  it('should parse products correctly', async () => {
    const parsedProducts = useCase.parseResponseProducts([product1, product2])

    expect(parsedProducts).toEqual([
      {
        id: product1.productId,
        code: product1.code,
        name: product1.name,
        image_url: product1.imageUrl,
        description: product1.description,
        is_swag: product1.isSwag,
        is_hidden: product1.isHidden,
        asset: {
          id: product1.asset?.assetId,
          name: product1.asset?.name,
          code: product1.asset?.code,
          type: product1.asset?.type,
          contract_address: product1.asset?.contractAddress,
        },
      },
      {
        id: product2.productId,
        code: product2.code,
        name: product2.name,
        image_url: product2.imageUrl,
        description: product2.description,
        is_swag: product2.isSwag,
        is_hidden: product2.isHidden,
        asset: {
          id: product2.asset?.assetId,
          name: product2.asset?.name,
          code: product2.asset?.code,
          type: product2.asset?.type,
          contract_address: product2.asset?.contractAddress,
        },
      },
    ])
  })

  it('should export endpoint', () => {
    expect(endpoint).toBe('/')
  })
})
