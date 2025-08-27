import { Request, Response } from 'express'

import { NftSupply, NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NftSupplyRepository from 'api/core/services/nft-supply'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetNftSupply extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftSupplyRepository: NftSupplyRepositoryType

  constructor(nftSupplyRepository?: NftSupplyRepositoryType) {
    super()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(nftSupplyList: NftSupply[]) {
    return nftSupplyList.map(nftSupply => ({
      id: nftSupply.nftSupplyId,
      name: nftSupply.name,
      description: nftSupply.description,
      url: nftSupply.url,
      code: nftSupply.code,
      contract_address: nftSupply.contractAddress,
      session_id: nftSupply.sessionId,
      resource: nftSupply.resource,
      total_supply: nftSupply.totalSupply,
      issuer: nftSupply.issuer,
    }))
  }
  async handle() {
    const assets = await this.nftSupplyRepository.getNftSupplyList()

    return {
      data: {
        nft_collections: this.parseResponse(assets),
      },
      message: 'Retrieved assets successfully',
    }
  }
}

export { endpoint }
