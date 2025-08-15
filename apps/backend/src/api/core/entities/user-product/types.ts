import { UserProduct as UserProductModel, UserProductStatus } from 'api/core/entities/user-product/model'

import { Product } from '../product/types'
import { User } from '../user/types'

export type UserProduct = UserProductModel

export type UserProductRepositoryType = {
  getUserProductById(userProductId: string): Promise<UserProduct | null>
  getUserProductsByUserContractAddress(contractAddress: string): Promise<UserProduct[]>
  createUserProduct(
    userProduct: { user: User; product: Product; status: UserProductStatus; claimedAt?: Date },
    save?: boolean
  ): Promise<UserProduct>
  updateUserProduct(userProductId: string, data: Partial<UserProduct>): Promise<UserProduct>
  saveUserProducts(userProduct: UserProduct[]): Promise<UserProduct[]>
}
