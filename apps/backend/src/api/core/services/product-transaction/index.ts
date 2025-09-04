import { Product } from 'api/core/entities/product/types'
import { ProductTransaction as ProductTransactionModel } from 'api/core/entities/product-transaction/model'
import { ProductTransaction, ProductTransactionRepositoryType } from 'api/core/entities/product-transaction/types'
import { SingletonBase } from 'api/core/framework/singleton/interface'

export default class ProductTransactionRepository extends SingletonBase implements ProductTransactionRepositoryType {
  constructor() {
    super()
  }

  async getProductTransactionById(productTransactionId: string): Promise<ProductTransaction | null> {
    return ProductTransactionModel.findOne({ where: { productTransactionId }, relations: ['product'] })
  }

  async getProductTransactionByHash(transactionHash: string): Promise<ProductTransaction | null> {
    return ProductTransactionModel.findOne({ where: { transactionHash }, relations: ['product'] })
  }

  async getProductsTransactionsByHash(transactionHash: string): Promise<ProductTransaction[] | null> {
    return ProductTransactionModel.find({ where: { transactionHash }, relations: ['product'] })
  }

  async createProductTransaction(
    productTransaction: {
      transactionHash: string
      product: Product
    },
    save?: boolean
  ): Promise<ProductTransaction> {
    const newProductTransaction = ProductTransactionModel.create({ ...productTransaction })
    if (save) {
      return this.saveProductTransaction(newProductTransaction)
    }
    return newProductTransaction
  }

  async updateProductTransaction(
    productTransactionId: string,
    data: Partial<ProductTransaction>
  ): Promise<ProductTransaction> {
    await ProductTransactionModel.update(productTransactionId, data)
    return this.getProductTransactionById(productTransactionId) as Promise<ProductTransaction>
  }

  async saveProductTransaction(productTransaction: ProductTransaction): Promise<ProductTransaction> {
    return ProductTransactionModel.save(productTransaction)
  }
}
