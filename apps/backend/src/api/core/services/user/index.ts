import { FindOneOptions } from 'typeorm'
import { User, UserRepositoryType } from 'api/core/entities/user/types'
import { User as UserModel } from 'api/core/entities/user/model'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class UserRepository extends SingletonBase implements UserRepositoryType {
  constructor() {
    super()
  }

  async getUserById(userId: string): Promise<User | null> {
    return UserModel.findOneBy({ userId })
  }

  async getUserByToken(token: string): Promise<User | null> {
    return UserModel.findOneBy({ uniqueToken: token })
  }

  async getUserByEmail(email: string, options?: FindOneOptions<User>): Promise<User | null> {
    return UserModel.findOne({ where: { email: email }, ...options })
  }

  async createUser(user: { uniqueToken: string; email: string }, save?: boolean): Promise<User> {
    const newUser = UserModel.create({ ...user })
    if (save) {
      return this.saveUser(newUser)
    }
    return newUser
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    await UserModel.update(userId, data)
    return this.getUserById(userId) as Promise<User>
  }

  async saveUser(user: User): Promise<User> {
    return UserModel.save(user)
  }
}
