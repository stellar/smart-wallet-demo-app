import { Mocked } from 'vitest'

import { ProductRepositoryType } from 'api/core/entities/product/types'

export function mockProductRepository(): Mocked<ProductRepositoryType> {
  return {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getProductByCode: vi.fn(),
    getProductsByCode: vi.fn(),
    getSwagProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    saveProduct: vi.fn(),
  }
}
