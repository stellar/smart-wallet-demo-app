import { Mocked } from 'vitest'

import { VendorRepositoryType } from 'api/core/entities/vendor/types'

export function mockVendorRepository(): Mocked<VendorRepositoryType> {
  return {
    getVendorById: vi.fn(),
    getVendorByContractAddress: vi.fn(),
    createVendor: vi.fn(),
    updateVendor: vi.fn(),
    saveVendor: vi.fn(),
  }
}
