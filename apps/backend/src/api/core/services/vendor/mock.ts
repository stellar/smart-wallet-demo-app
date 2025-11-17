import { Mocked } from 'vitest'

import { VendorRepositoryType } from 'api/core/entities/vendor/types'

export function mockVendorRepository(): Mocked<VendorRepositoryType> {
  return {
    getVendors: vi.fn(),
    getVendorById: vi.fn(),
    getVendorByWalletAddress: vi.fn(),
    createVendor: vi.fn(),
    updateVendor: vi.fn(),
    saveVendor: vi.fn(),
  }
}
