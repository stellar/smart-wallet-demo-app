import { Request, Response } from 'express'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import AssetRepository from 'api/core/services/asset'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetAssets extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepositoryType

  constructor(assetRepository?: AssetRepositoryType) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponseAssets(assets: Asset[]) {
    return assets.map(asset => ({
      id: asset.assetId,
      name: asset.name,
      code: asset.code,
      type: asset.type,
      contract_address: asset.contractAddress,
    }))
  }
  async handle() {
    const assets = await this.assetRepository.getAssets()

    return {
      data: {
        assets: this.parseResponseAssets(assets),
      },
      message: 'Retrieved assets successfully',
    }
  }
}

export { endpoint }
