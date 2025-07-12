import { Mocked } from 'vitest'
import { SDPEmbeddedWalletsType } from './types'

export function mockSDPEmbeddedWallets(): Mocked<SDPEmbeddedWalletsType> {
  return {
    createWallet: vi.fn(),
    checkWalletStatus: vi.fn(),
    getContractAddress: vi.fn(),
  }
}
