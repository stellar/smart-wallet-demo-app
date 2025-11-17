import { Request, Response } from 'express'

import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import ProductRepository from 'api/core/services/product'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetProducts extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private productRepository: ProductRepositoryType

  constructor(productRepository?: ProductRepositoryType) {
    super()
    this.productRepository = productRepository || ProductRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseProducts(products: Product[]) {
    return products.map(product => ({
      id: product.productId,
      code: product.code,
      name: product.name,
      image_url: product.imageUrl,
      description: product.description,
      is_swag: product.isSwag,
      is_hidden: product.isHidden,
      asset: {
        id: product.asset?.assetId,
        name: product.asset?.name,
        code: product.asset?.code,
        type: product.asset?.type,
        contract_address: product.asset?.contractAddress,
      },
    }))
  }
  async handle() {
    const products = await this.productRepository.getProducts()

    return {
      data: {
        products: this.parseResponseProducts(products),
      },
      message: 'Retrieved products successfully',
    }
  }
}

export { endpoint }
