import { Mocked } from 'vitest'

import { ProductTransactionRepositoryType } from 'api/core/entities/product-transaction/types'

export function mockProductTransactionRepository(): Mocked<ProductTransactionRepositoryType> {
  return {
    getProductTransactionById: vi.fn(),
    getProductTransactionByHash: vi.fn(),
    getProductsTransactionsByHash: vi.fn(),
    createProductTransaction: vi.fn(),
    updateProductTransaction: vi.fn(),
    saveProductTransaction: vi.fn(),
  }
}
