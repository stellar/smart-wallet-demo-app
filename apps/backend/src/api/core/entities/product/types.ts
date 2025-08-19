import { FindOneOptions } from 'typeorm'

import { Product as ProductModel } from 'api/core/entities/product/model'

import { Asset } from '../asset/types'
import { UserProduct } from '../user-product/types'

export type Product = ProductModel

export type ProductRepositoryType = {
  getProductById(productId: string): Promise<Product | null>
  getProductsByCode(code: string[]): Promise<Product[]>
  getSwagProducts(options?: FindOneOptions<Product>): Promise<Product[]>
  createProduct(
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
  ): Promise<Product>
  updateProduct(productId: string, data: Partial<Product>): Promise<Product>
  saveProduct(product: Product): Promise<Product>
}
