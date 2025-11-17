import { Request, Response } from 'express'

import { Asset } from 'api/core/entities/asset/types'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import ProductRepository from 'api/core/services/product'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:id'

export class UpdateProduct extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private productRepository: ProductRepositoryType

  constructor(productRepository?: ProductRepositoryType) {
    super()
    this.productRepository = productRepository || ProductRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const productId = request.params?.id
    const payload = { ...request.body, id: productId } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseProduct(product: Product) {
    return {
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
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const updatedFields = {
      code: validatedData.code,
      name: validatedData.name,
      imageUrl: validatedData.image_url,
      description: validatedData.description,
      isSwag: validatedData.is_swag,
      isHidden: validatedData.is_hidden,
    } as Partial<Product>

    if (validatedData.asset_id) {
      updatedFields.asset = { assetId: validatedData.asset_id } as Asset
    }

    const updatedProduct = await this.productRepository.updateProduct(validatedData.id, updatedFields)

    return {
      data: {
        product: this.parseResponseProduct(updatedProduct),
      },
      message: 'Product updated successfully',
    }
  }
}

export { endpoint }
