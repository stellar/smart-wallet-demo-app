import { FindOneOptions, ILike } from 'typeorm'

import { Asset } from 'api/core/entities/asset/types'
import { Product as ProductModel } from 'api/core/entities/product/model'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { UserProduct } from 'api/core/entities/user-product/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class ProductRepository extends SingletonBase implements ProductRepositoryType {
  constructor() {
    super()
  }

  async getProductById(productId: string): Promise<Product | null> {
    return ProductModel.findOneBy({ productId })
  }

  async getProductByCode(code: string): Promise<Product | null> {
    return ProductModel.findOneBy({ code: ILike(code) })
  }

  async getProductsByCode(codes: string[]): Promise<Product[]> {
    return ProductModel.find({
      where: codes.map(code => ({
        code: ILike(code),
      })),
    })
  }

  async getSwagProducts(options?: FindOneOptions<Product>): Promise<Product[]> {
    const whereCondition = { isSwag: true, ...options?.where }

    return ProductModel.find({ ...options, where: whereCondition })
  }

  async createProduct(
    product: {
      code: string
      name?: string
      imageUrl?: string
      description: string
      isSwag: boolean
      isHidden: boolean
      asset: Asset
      userProducts?: UserProduct[]
    },
    save?: boolean
  ): Promise<Product> {
    const newProduct = ProductModel.create({ ...product })
    if (save) {
      return this.saveProduct(newProduct)
    }
    return newProduct
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    await ProductModel.update(productId, data)
    return this.getProductById(productId) as Promise<Product>
  }

  async saveProduct(product: Product): Promise<Product> {
    return ProductModel.save(product)
  }
}
