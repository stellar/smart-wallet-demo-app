import { Request, Response } from 'express'

import { NftSupply, NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NftSupplyRepository from 'api/core/services/nft-supply'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:resource/:id'

export class GetNftMetadata extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftSupplyRepository: NftSupplyRepositoryType

  constructor(nftSupplyRepository?: NftSupplyRepositoryType) {
    super()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const tokenId = request.params?.id
    const resource = request.params?.resource
    const payload = { id: tokenId, resource: resource } as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(tokenId: string | number, nftSupply: NftSupply) {
    return {
      name: `${nftSupply.name} #${tokenId}`,
      description: `${nftSupply.description} #${tokenId}`,
      image: nftSupply.url,
      external_url: nftSupply.url.split('/').slice(0, -1).join('/'),
      attributes: [
        {
          trait_type: 'Token ID',
          value: tokenId as number,
        },
        {
          trait_type: 'Collection',
          value: nftSupply.name,
        },
      ],
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)

    const nftSupply = await this.nftSupplyRepository.getNftSupplyByResourceAndTokenId(
      validatedData.resource,
      validatedData.id
    )
    if (!nftSupply) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
    }

    return this.parseResponse(validatedData.id, nftSupply)
  }
}

export { endpoint }
