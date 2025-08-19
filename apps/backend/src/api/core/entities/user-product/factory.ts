import { faker } from '@faker-js/faker'

import { UserProduct, UserProductStatus } from 'api/core/entities/user-product/model'

import { productFactory } from '../product/factory'
import { Product } from '../product/types'
import { userFactory } from '../user/factory'
import { User } from '../user/types'

interface UserProductFactoryArgs {
  userProductId?: string
  user?: User
  product?: Product
  status?: UserProductStatus
  claimedAt?: Date
}

export const userProductFactory = ({
  userProductId,
  user,
  product,
  status,
  claimedAt,
}: UserProductFactoryArgs): UserProduct => {
  const userProduct = new UserProduct()
  userProduct.userProductId = userProductId ?? faker.string.uuid()
  userProduct.user = user ?? userFactory({})
  userProduct.product = product ?? productFactory({})
  userProduct.status = status ?? 'unclaimed'
  userProduct.claimedAt = claimedAt ?? undefined
  return userProduct
}
