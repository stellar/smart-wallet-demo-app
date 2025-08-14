import { In } from 'typeorm'

import { Product as ProductModel } from 'api/core/entities/product/model'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class ProductRepository extends SingletonBase implements ProductRepositoryType {
  constructor() {
    super()
  }

  async getProductById(productId: string): Promise<Product | null> {
    return ProductModel.findOneBy({ productId })
  }

  async getProductsByCode(code: string[]): Promise<Product[]> {
    return ProductModel.findBy({ code: In(code) })
  }

  async createProduct(product: { code: string; name?: string; description: string }, save?: boolean): Promise<Product> {
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
