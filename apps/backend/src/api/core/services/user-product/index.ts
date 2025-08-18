import { FindOneOptions } from 'typeorm'

import { Product } from 'api/core/entities/product/types'
import { User } from 'api/core/entities/user/types'
import { UserProduct as UserProductModel, UserProductStatus } from 'api/core/entities/user-product/model'
import { UserProduct, UserProductRepositoryType } from 'api/core/entities/user-product/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class UserProductRepository extends SingletonBase implements UserProductRepositoryType {
  constructor() {
    super()
  }

  async getUserProductById(userProductId: string): Promise<UserProduct | null> {
    return UserProductModel.findOneBy({ userProductId })
  }

  async getUserProductsByUserContractAddress(contractAddress: string): Promise<UserProduct[]> {
    return UserProductModel.find({
      where: { user: { contractAddress } },
      relations: ['user', 'product', 'product.asset'],
      order: { product: { isHidden: 'DESC' } },
    })
  }

  async getUserProductsByUserContractAddressAndAssetCode(
    contractAddress: string,
    assetCode: string,
    options?: FindOneOptions<UserProduct>
  ): Promise<UserProduct[]> {
    const whereCondition = {
      ...options?.where,
      user: { contractAddress },
      product: { asset: { code: assetCode } },
    }

    return UserProductModel.find({
      where: whereCondition,
      relations: ['product', 'product.asset'],
      order: { product: { isHidden: 'DESC' } },
    })
  }

  async createUserProduct(
    userProduct: {
      user: User
      product: Product
      status: UserProductStatus
      claimedAt?: Date
    },
    save?: boolean
  ): Promise<UserProduct> {
    const newUserProduct = UserProductModel.create({ ...userProduct })
    if (save) {
      return (await this.saveUserProducts([newUserProduct]))[0]
    }
    return newUserProduct
  }

  async updateUserProduct(userProductId: string, data: Partial<UserProduct>): Promise<UserProduct> {
    await UserProductModel.update(userProductId, data)
    return this.getUserProductById(userProductId) as Promise<UserProduct>
  }

  async saveUserProducts(userProducts: UserProduct[]): Promise<UserProduct[]> {
    return UserProductModel.save(userProducts)
  }
}
