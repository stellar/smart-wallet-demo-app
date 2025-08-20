import { Request, Response } from 'express'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import AssetRepository from 'api/core/services/asset'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:id'

export class UpdateAsset extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepositoryType

  constructor(assetRepository?: AssetRepositoryType) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const assetId = request.params?.id
    const payload = { ...request.body, id: assetId } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseAsset(asset: Asset) {
    return {
      name: asset.name,
      code: asset.code,
      type: asset.type,
      contract_address: asset.contractAddress,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const updatedFields = {
      name: validatedData.name,
      code: validatedData.code,
      type: validatedData.type,
      contractAddress: validatedData.contract_address,
    }

    const updatedAsset = await this.assetRepository.updateAsset(validatedData.id, updatedFields)

    return {
      data: {
        asset: this.parseResponseAsset(updatedAsset),
      },
      message: 'Asset updated successfully',
    }
  }
}

export { endpoint }
