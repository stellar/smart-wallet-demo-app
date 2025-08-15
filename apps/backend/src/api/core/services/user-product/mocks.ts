import { Mocked } from 'vitest'

import { UserProductRepositoryType } from 'api/core/entities/user-product/types'

export function mockUserProductRepository(): Mocked<UserProductRepositoryType> {
  return {
    getUserProductById: vi.fn(),
    getUserProductsByUserContractAddress: vi.fn(),
    createUserProduct: vi.fn(),
    updateUserProduct: vi.fn(),
    saveUserProducts: vi.fn(),
  }
}
