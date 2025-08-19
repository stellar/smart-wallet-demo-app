import { Mocked } from 'vitest'

import { UserRepositoryType } from 'api/core/entities/user/types'

export function mockUserRepository(): Mocked<UserRepositoryType> {
  return {
    getUserById: vi.fn(),
    getUserByToken: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserByContractAddress: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    saveUser: vi.fn(),
  }
}
