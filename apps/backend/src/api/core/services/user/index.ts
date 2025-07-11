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

  async createUser(user: { uniqueToken: string; email: string }, save?: boolean): Promise<User> {
    const newUser = UserModel.create({ ...user })
    if (save) {
      return this.saveUser(newUser)
    }
    return newUser
  }

  async saveUser(user: User): Promise<User> {
    return UserModel.save(user)
  }
}
