import { User as UserModel } from 'api/core/entities/user/model'

export type User = UserModel

export type UserRepositoryType = {
  getUserById(userId: string): Promise<User | null>
  getUserByToken(token: string): Promise<User | null>
  createUser(user: { uniqueToken: string; email: string }, save?: boolean): Promise<User>
  saveUser(user: User): Promise<User>
}
