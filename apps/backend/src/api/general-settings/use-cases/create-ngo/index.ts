import { Request, Response } from 'express'

import { Ngo, NgoRepositoryType } from 'api/core/entities/ngo/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NgoRepository from 'api/core/services/ngo'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class CreateNgo extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private ngoRepository: NgoRepositoryType

  constructor(ngoRepository?: NgoRepositoryType) {
    super()
    this.ngoRepository = ngoRepository || NgoRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.body as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.CREATED).json(result)
  }

  parseResponse(ngo: Ngo) {
    return {
      id: ngo.ngoId,
      name: ngo.name,
      description: ngo.description,
      wallet_address: ngo.walletAddress,
      profile_image: ngo.profileImage,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const ngo = {
      name: validatedData.name,
      description: validatedData.description,
      walletAddress: validatedData.wallet_address,
      profileImage: validatedData.profile_image,
    }

    const newNgo = await this.ngoRepository.createNgo(ngo, true)

    return {
      data: {
        ngo: this.parseResponse(newNgo),
      },
      message: 'NGO created successfully',
    }
  }
}

export { endpoint }
