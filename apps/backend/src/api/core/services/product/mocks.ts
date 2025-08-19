import { Mocked } from 'vitest'

import { ProductRepositoryType } from 'api/core/entities/product/types'

export function mockProductRepository(): Mocked<ProductRepositoryType> {
  return {
    getProductById: vi.fn(),
    getProductsByCode: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    saveProduct: vi.fn(),
  }
}
