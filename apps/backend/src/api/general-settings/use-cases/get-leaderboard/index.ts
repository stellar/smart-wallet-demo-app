import { Request, Response } from 'express'

import { NftRepositoryType } from 'api/core/entities/nft/types'
import { User } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import NftRepository from 'api/core/services/nft'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetLeaderboard extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepositoryType

  constructor(nftRepository?: NftRepositoryType) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(nfts: { user: User; nftCount: number }[]) {
    return nfts.map(nft => ({
      id: nft.user.userId,
      email: nft.user.email,
      contract_address: nft.user.contractAddress as string,
      token_count: nft.nftCount,
    }))
  }

  async handle() {
    const leaderboard = await this.nftRepository.getLeaderboard()

    return {
      data: {
        leaderboard: this.parseResponse(leaderboard),
      },
      message: 'Retrieved Leaderboard successfully',
    }
  }
}

export { endpoint }
