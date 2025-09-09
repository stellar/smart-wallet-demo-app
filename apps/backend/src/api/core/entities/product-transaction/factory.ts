import { faker } from '@faker-js/faker'

import { ProductTransaction } from 'api/core/entities/product-transaction/model'

import { productFactory } from '../product/factory'
import { Product } from '../product/model'

interface ProductTransactionFactoryArgs {
  productTransactionId?: string
  transactionHash?: string
  product?: Product
}

export const productTransactionFactory = ({
  productTransactionId,
  transactionHash,
  product,
}: ProductTransactionFactoryArgs): ProductTransaction => {
  const productTransaction = new ProductTransaction()
  productTransaction.productTransactionId = productTransactionId ?? faker.string.uuid()
  productTransaction.transactionHash = transactionHash ?? faker.string.alphanumeric({ casing: 'lower', length: 56 })
  productTransaction.product = product ?? productFactory({})
  return productTransaction
}
