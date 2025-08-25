import { Request, Response } from 'express'

import { NftSupply, NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NftSupplyRepository from 'api/core/services/nft-supply'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:id'

export class UpdateNftSupply extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftSupplyRepository: NftSupplyRepositoryType

  constructor(nftSupplyRepository?: NftSupplyRepositoryType) {
    super()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const nftSupplyId = request.params?.id
    const payload = { ...request.body, id: nftSupplyId } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(nftSupply: NftSupply) {
    return {
      name: nftSupply.name,
      description: nftSupply.description,
      url: nftSupply.url,
      code: nftSupply.code,
      contract_address: nftSupply.contractAddress,
      session_id: nftSupply.sessionId,
      resource: nftSupply.resource,
      total_supply: nftSupply.totalSupply,
      issuer: nftSupply.issuer,
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)
    const updatedFields = {
      name: validatedData.name,
      description: validatedData.description,
      url: validatedData.url,
      code: validatedData.code,
      contractAddress: validatedData.contract_address,
      sessionId: validatedData.session_id,
      resource: validatedData.resource,
      totalSupply: validatedData.total_supply,
      issuer: validatedData.issuer,
    }

    const updatedNftSupply = await this.nftSupplyRepository.updateNftSupply(validatedData.id, updatedFields)

    return {
      data: {
        nft_collection: this.parseResponse(updatedNftSupply),
      },
      message: 'NftSupply updated successfully',
    }
  }
}

export { endpoint }
