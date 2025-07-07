import { faker } from '@faker-js/faker'
import { User } from 'api/core/entities/user/model'

interface UserFactoryArgs {
  userId?: string
  email?: string
  uniqueToken?: string
  publicKey?: string
}

export const userFactory = ({ userId, email, uniqueToken, publicKey }: UserFactoryArgs): User => {
  const user = new User()
  user.userId = userId ?? faker.string.uuid()
  user.email = email ?? faker.internet.email()
  user.uniqueToken = uniqueToken ?? faker.string.uuid()
  user.publicKey = publicKey ?? faker.string.uuid()
  return user
}
