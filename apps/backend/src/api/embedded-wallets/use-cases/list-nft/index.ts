import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { getTokenData } from 'api/core/helpers/get-token-data'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

import { NftSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft'
export class ListNft extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType

  constructor(userRepository?: UserRepositoryType) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { email: request.userData?.email } as RequestSchemaT
    if (!payload.email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(response: ResponseSchemaT['data']): ResponseSchemaT {
    return {
      data: {
        ...response,
      },
      message: 'Tokens list retrieved successfully',
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)

    // Check if user exists
    const user = await this.userRepository.getUserByEmail(validatedData.email, { relations: ['nfts'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    // Return empty array if user does not have a wallet
    if (!user.contractAddress) return this.parseResponse({ nfts: [] })

    // TODO: get NFTs from DB, from contract (enumerable) and merge to return
    // TODO: implement a list_owner_tokens method in NFT contract using Enumerable interface (https://github.com/OpenZeppelin/stellar-contracts/blob/main/packages/tokens/src/non_fungible/extensions/enumerable/mod.rs)
    const nfts: NftSchemaT[] = []

    for (const userNft of user.nfts ?? []) {
      const tokenData = await getTokenData({ assetContractAddress: userNft.contractAddress, tokenId: userNft.tokenId })

      const nft: NftSchemaT = {
        token_id: userNft.tokenId,
        code: tokenData.symbol,
        name: tokenData.name,
        description: tokenData.description || '',
        url: tokenData.url || '',
        contract_address: userNft.contractAddress || '',
      }

      nfts.push(nft)
    }

    // Parse the response to match the expected schema
    const parsedResponse: ResponseSchemaT['data'] = {
      nfts,
    }
    return this.parseResponse(parsedResponse)
  }
}

export { endpoint }
