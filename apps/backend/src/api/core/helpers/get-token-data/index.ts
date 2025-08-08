import { scValToNative, xdr } from '@stellar/stellar-sdk'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { NftRepositoryType } from 'api/core/entities/nft/types'
import AssetRepository from 'api/core/services/asset'
import NftRepository from 'api/core/services/nft'
import { messages } from 'api/embedded-wallets/constants/messages'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import SorobanService from 'interfaces/soroban'
import { ISorobanService, SimulateContractOperation } from 'interfaces/soroban/types'

import { TokenData } from './types'

export const getTokenData = async ({
  assetCode, // Symbol
  assetContractAddress,
  tokenId,
  assetRepository,
  nftRepository,
  sorobanService,
}: {
  assetCode?: string
  assetContractAddress?: string
  tokenId?: string
  assetRepository?: AssetRepositoryType
  nftRepository?: NftRepositoryType
  sorobanService?: ISorobanService
}): Promise<TokenData> => {
  // TODO: create return type
  const assetRepositoryInstance = assetRepository || AssetRepository.getInstance()
  const sorobanServiceInstance = sorobanService || SorobanService.getInstance()
  const nftRepositoryInstance = nftRepository || NftRepository.getInstance()

  // Get asset contract address
  let asset: Asset | null = null

  if (!assetContractAddress) {
    if (assetCode) {
      asset = await assetRepositoryInstance.getAssetByCode(assetCode as string)
    } else if (tokenId) {
      const nft = await nftRepositoryInstance.getNftByTokenId(tokenId)
      asset = await assetRepositoryInstance.getAssetByContractAddress(nft?.contractAddress as string)
    } else {
      throw new ResourceNotFoundException(messages.UNABLE_TO_FIND_ASSET_OR_CONTRACT)
    }

    assetContractAddress = asset?.contractAddress
  }

  const { simulationResponse: symbolSimulationResponse } = await sorobanServiceInstance.simulateContractOperation({
    contractId: assetContractAddress,
    method: 'symbol',
  } as SimulateContractOperation)

  const symbol: string = scValToNative(symbolSimulationResponse.result?.retval as xdr.ScVal).toString()

  const { simulationResponse: nameSimulationResponse } = await sorobanServiceInstance.simulateContractOperation({
    contractId: assetContractAddress,
    method: 'name',
  } as SimulateContractOperation)

  const name: string = scValToNative(nameSimulationResponse.result?.retval as xdr.ScVal).toString()

  const { simulationResponse: tokenUriSimulationResponse } = await sorobanServiceInstance.simulateContractOperation({
    contractId: assetContractAddress,
    method: 'token_uri',
  } as SimulateContractOperation)

  let tokenUri: string = ''
  if (tokenUriSimulationResponse) {
    tokenUri = scValToNative(tokenUriSimulationResponse.result?.retval as xdr.ScVal).toString()

    // TODO: get token_uri json content, parse and extract data
  }

  return { symbol, name, tokenUri }
}
