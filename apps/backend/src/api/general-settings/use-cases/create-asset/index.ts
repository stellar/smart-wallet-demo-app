import { Request, Response } from 'express'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import AssetRepository from 'api/core/services/asset'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateAsset extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepositoryType

  constructor(assetRepository?: AssetRepositoryType) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
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
    const asset = {
      name: validatedData.name,
      code: validatedData.code,
      type: validatedData.type,
      contractAddress: validatedData.contract_address,
    }

    const newAsset = await this.assetRepository.createAsset(asset, true)

    return {
      data: {
        asset: this.parseResponseAsset(newAsset),
      },
      message: 'Asset created successfully',
    }
  }
}

export { endpoint }
