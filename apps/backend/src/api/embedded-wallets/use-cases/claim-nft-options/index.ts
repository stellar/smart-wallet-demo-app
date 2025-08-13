import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NftRepository from 'api/core/services/nft'
import NftSupplyRepository from 'api/core/services/nft-supply'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft/claim/options'

export class ClaimNftOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepository
  private nftSupplyRepository: NftSupplyRepository
  private userRepository: UserRepositoryType
  private sorobanService: ISorobanService

  constructor(
    userRepository?: UserRepositoryType,
    nftRepository?: NftRepository,
    nftSupplyRepository?: NftSupplyRepository,
    sorobanService?: ISorobanService
  ) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      ...request.query,
      email: request.userData?.email,
    } as RequestSchemaT

    if (!payload.email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)

    // Get user data
    const { email } = validatedData

    const user = await this.userRepository.getUserByEmail(email, { relations: ['passkeys'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    if (!user.contractAddress) {
      throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_WALLET)
    }

    if (!user.passkeys.length) {
      throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_PASSKEYS)
    }

    // Get NFT Supply data
    let nftSupply = await this.nftSupplyRepository.getNftSupplyByResource(validatedData.resource)
    if (!nftSupply) {
      nftSupply = await this.nftSupplyRepository.getNftSupplyByContractAddress(validatedData.resource)
    }

    if (!nftSupply) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
    }

    if (nftSupply.totaSupply - nftSupply.currentSupply <= 0) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_ENOUGH)
    }

    // Validate if user already own a NFT to that session
    const userNft = await this.nftRepository.getNftBySessionId(nftSupply.sessionId)

    if (userNft) {
      throw new ResourceNotFoundException(messages.NFT_ALREADY_OWNED_BY_USER)
    }

    return {
      data: {
        nft: {
          ...nftSupply,
        },
      },
      message: 'Retrieved NFT options successfully',
    }
  }
}

export { endpoint }
