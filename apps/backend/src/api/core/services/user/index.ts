import { User, UserRepositoryType } from 'api/core/entities/user/types'
import { User as UserModel } from 'api/core/entities/user/model'

export default class UserRepository implements UserRepositoryType {
  async getUserById(userId: string): Promise<User | null> {
    return UserModel.findOneBy({ userId })
  }
}
