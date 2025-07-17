import { Mocked } from 'vitest'
import { HorizonType } from './types'

export function mockHorizon(): Mocked<HorizonType> {
  return {
    getAccountBalance: vi.fn(),
  }
}
