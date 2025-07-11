import { UserRepositoryType } from 'api/core/entities/user/types'
import { Mocked } from 'vitest'

export function mockUserRepository(): Mocked<UserRepositoryType> {
  return {
    getUserById: vi.fn(),
    getUserByToken: vi.fn(),
    createUser: vi.fn(),
    saveUser: vi.fn(),
  }
}
