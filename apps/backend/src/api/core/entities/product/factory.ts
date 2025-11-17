import { faker } from '@faker-js/faker'

import { Product } from 'api/core/entities/product/model'

import { assetFactory } from '../asset/factory'
import { Asset } from '../asset/types'
import { UserProduct } from '../user-product/model'

interface ProductFactoryArgs {
  productId?: string
  code?: string
  name?: string
  imageUrl?: string
  description?: string
  isSwag?: boolean
  isHidden?: boolean
  asset?: Asset
  userProducts?: UserProduct[]
}

export const productFactory = ({
  productId,
  code,
  name,
  imageUrl,
  description,
  isSwag,
  isHidden,
  asset,
  userProducts,
}: ProductFactoryArgs): Product => {
  const product = new Product()
  product.productId = productId ?? faker.string.uuid()
  product.code = code ?? faker.string.alphanumeric({ casing: 'lower', length: 6 })
  product.name = name ?? faker.commerce.product()
  product.imageUrl = imageUrl ?? faker.image.url()
  product.description = description ?? faker.commerce.productDescription()
  product.isSwag = isSwag ?? false
  product.isHidden = isHidden ?? false
  product.asset = asset ?? assetFactory({})
  product.userProducts = userProducts ?? []
  return product
}
