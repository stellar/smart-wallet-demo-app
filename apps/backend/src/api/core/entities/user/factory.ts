import { faker } from '@faker-js/faker'

import { User } from 'api/core/entities/user/model'
import { Passkey } from '../passkey/types'

interface UserFactoryArgs {
  userId?: string
  email?: string
  uniqueToken?: string
  publicKey?: string
  passkeys?: Passkey[]
}

export const userFactory = ({ userId, email, uniqueToken, publicKey, passkeys }: UserFactoryArgs): User => {
  const user = new User()
  user.userId = userId ?? faker.string.uuid()
  user.email = email ?? faker.internet.email()
  user.uniqueToken = uniqueToken ?? faker.string.uuid()
  user.publicKey = publicKey ?? faker.string.uuid()
  user.passkeys = passkeys ?? []
  return user
}
