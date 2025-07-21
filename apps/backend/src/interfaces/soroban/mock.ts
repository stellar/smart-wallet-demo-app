import { Mocked } from 'vitest'
import { ISorobanService } from './types'

export function soroban(): Mocked<ISorobanService> {
  return {
    simulateContract: vi.fn(),
  }
}
