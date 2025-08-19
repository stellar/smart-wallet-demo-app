import { faker } from '@faker-js/faker'

import { Product } from 'api/core/entities/product/model'

interface ProductFactoryArgs {
  productId?: string
  code?: string
  name?: string
  description?: string
}

export const productFactory = ({ productId, code, name, description }: ProductFactoryArgs): Product => {
  const product = new Product()
  product.productId = productId ?? faker.string.uuid()
  product.code = code ?? faker.string.alphanumeric({ casing: 'lower', length: 6 })
  product.name = name ?? faker.commerce.product()
  product.description = description ?? faker.commerce.productDescription()
  return product
}
