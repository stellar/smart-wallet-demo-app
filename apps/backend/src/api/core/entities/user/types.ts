import { User as UserModel } from 'api/core/entities/user/model'

export type User = UserModel

export type UserRepositoryType = {
  getUserById(userId: string): Promise<User | null>
}
