import { Request, Response } from 'express'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { NftRepositoryType } from 'api/core/entities/nft/types'
import { User } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import AssetRepository from 'api/core/services/asset'
import NftRepository from 'api/core/services/nft'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'

import { ResponseSchemaT } from './types'

const endpoint = '/'

export class GetLeaderboard extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepositoryType
  private assetRepository: AssetRepositoryType

  constructor(
    nftRepository?: NftRepositoryType,
    assetRepository?: AssetRepositoryType
  ) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
  }

  async executeHttp(_request: Request, response: Response<ResponseSchemaT>) {
    const result = await this.handle()
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(nfts: { user: User; nftSupplycontractAddress: string; nftCount: number; asset: Asset }[]) {
    return nfts.map(nft => ({
      id: nft.user.userId,
      email: nft.user.email,
      contract_address: nft.user.contractAddress as string,
      token_count: nft.nftCount,
      asset: nft.asset,
    }))
  }

  async handle() {
    const leaderboard = await this.nftRepository.getLeaderboard()

    let asset: Asset | null
    const leaderboardWithAsset: { user: User; nftSupplycontractAddress: string; nftCount: number; asset: Asset }[] = []

    for (const entry of leaderboard) {
      asset = await this.assetRepository.getAssetByContractAddress(entry.nftSupplycontractAddress)
      leaderboardWithAsset.push({
        ...entry,
        asset: asset as Asset,
      })
    }

    return {
      data: {
        leaderboard: this.parseResponse(leaderboardWithAsset),
      },
      message: 'Retrieved Leaderboard successfully',
    }
  }
}

export { endpoint }
