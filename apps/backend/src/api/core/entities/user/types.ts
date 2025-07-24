import { User as UserModel } from 'api/core/entities/user/model'
import { FindOneOptions } from 'api/core/framework/orm/base'

export type User = UserModel

export type UserRepositoryType = {
  getUserById(userId: string): Promise<User | null>
  getUserByToken(token: string): Promise<User | null>
  getUserByEmail(email: string, options?: FindOneOptions<User>): Promise<User | null>
  createUser(user: { uniqueToken: string; email: string }, save?: boolean): Promise<User>
  updateUser(userId: string, data: Partial<User>): Promise<User>
  saveUser(user: User): Promise<User>
}
