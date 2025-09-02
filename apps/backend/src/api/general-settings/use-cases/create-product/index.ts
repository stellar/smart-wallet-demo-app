import { Request, Response } from 'express'

import { Asset } from 'api/core/entities/asset/types'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import ProductRepository from 'api/core/services/product'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateProduct extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private productRepository: ProductRepositoryType

  constructor(productRepository?: ProductRepositoryType) {
    super()
    this.productRepository = productRepository || ProductRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
  }

  parseResponseProduct(product: Product) {
    return {
      code: product.code,
      name: product.name,
      image_url: product.imageUrl,
      description: product.description,
      is_swag: product.isSwag,
      is_hidden: product.isHidden,
      asset_id: product.asset.assetId,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const product = {
      code: validatedData.code,
      name: validatedData.name,
      imageUrl: validatedData.image_url,
      description: validatedData.description || '',
      isSwag: validatedData.is_swag || false,
      isHidden: validatedData.is_hidden || false,
      asset: { assetId: validatedData.asset_id } as Asset,
    }

    const newProduct = await this.productRepository.createProduct(product, true)

    return {
      data: {
        product: this.parseResponseProduct(newProduct),
      },
      message: 'Product created successfully',
    }
  }
}

export { endpoint }
