import { Mocked } from 'vitest'

import { AssetRepositoryType } from 'api/core/entities/asset/types'

export function mockAssetRepository(): Mocked<AssetRepositoryType> {
  return {
    getAssetById: vi.fn(),
    getAssetByContractAddress: vi.fn(),
    getAssetByType: vi.fn(),
    getAssetByCode: vi.fn(),
    createAsset: vi.fn(),
    updateAsset: vi.fn(),
    saveAsset: vi.fn(),
  }
}
