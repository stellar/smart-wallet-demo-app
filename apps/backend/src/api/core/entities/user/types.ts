import { User as UserModel } from 'api/core/entities/user/model'
import { FindOneOptions } from 'api/core/framework/orm/base'

import { GiftClaim } from '../gift-claim/model'
import { Otp } from '../otp/types'
import { Passkey } from '../passkey/types'
import { UserProduct } from '../user-product/types'

export type User = UserModel

export type UserRepositoryType = {
  getUserById(userId: string): Promise<User | null>
  getUserByToken(token: string): Promise<User | null>
  getUserByContractAddress(contractAddress: string): Promise<User | null>
  getUserByEmail(email: string, options?: FindOneOptions<User>): Promise<User | null>
  createUser(
    user: {
      email: string
      uniqueToken: string
      contractAddress?: string
      passkeys?: Passkey[]
      otps?: Otp[]
      giftClaims?: GiftClaim[]
      userProducts?: UserProduct[]
    },
    save?: boolean
  ): Promise<User>
  updateUser(userId: string, data: Partial<User>): Promise<User>
  saveUser(user: User): Promise<User>
}
