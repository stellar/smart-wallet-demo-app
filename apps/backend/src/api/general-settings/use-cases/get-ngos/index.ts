import { Request, Response } from 'express'

import { Ngo, NgoRepositoryType } from 'api/core/entities/ngo/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NgoRepository from 'api/core/services/ngo'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetNgos extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private ngoRepository: NgoRepositoryType

  constructor(ngoRepository?: NgoRepositoryType) {
    super()
    this.ngoRepository = ngoRepository || NgoRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(ngos: Ngo[]) {
    return ngos.map(ngo => ({
      id: ngo.ngoId,
      name: ngo.name,
      description: ngo.description,
      wallet_address: ngo.walletAddress,
      profile_image: ngo.profileImage,
    }))
  }

  async handle() {
    const ngos = await this.ngoRepository.getNgos()

    return {
      data: {
        ngos: this.parseResponse(ngos),
      },
      message: 'Retrieved NGOs successfully',
    }
  }
}

export { endpoint }
