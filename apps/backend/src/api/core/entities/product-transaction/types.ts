import { ProductTransaction as ProductTransactionModel } from 'api/core/entities/product-transaction/model'

import { Product } from '../product/types'

export type ProductTransaction = ProductTransactionModel

export type ProductTransactionRepositoryType = {
  getProductTransactionById(productTransactionId: string): Promise<ProductTransaction | null>
  getProductTransactionByHash(transactionHash: string): Promise<ProductTransaction | null>
  getProductsTransactionsByHash(transactionHash: string): Promise<ProductTransaction[] | null>
  createProductTransaction(
    productTransaction: {
      transactionHash: string
      product: Product
    },
    save?: boolean
  ): Promise<ProductTransaction>
  updateProductTransaction(productTransactionId: string, data: Partial<ProductTransaction>): Promise<ProductTransaction>
  saveProductTransaction(productTransaction: ProductTransaction): Promise<ProductTransaction>
}
