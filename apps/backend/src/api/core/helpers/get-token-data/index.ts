import { scValToNative, xdr } from '@stellar/stellar-sdk'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import { NftRepositoryType } from 'api/core/entities/nft/types'
import AssetRepository from 'api/core/services/asset'
import NftRepository from 'api/core/services/nft'
import { fetchSep50Metadata, Sep50Metadata } from 'api/core/utils/fetch-sep50-metadata'
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
  let description: string = ''
  let url: string = ''
  let image: string = ''
  let externalUrl: string = ''
  let collection: { name: string; family: string } | undefined
  let attributes:
    | {
        traitType: string
        value: string | number | boolean
        displayType?: string
        maxValue?: number
      }[]
    | undefined
  let properties:
    | Record<
        string,
        | string
        | number
        | boolean
        | string[]
        | number[]
        | {
            type?: string
            uri?: string
            [key: string]: unknown
          }[]
      >
    | undefined

  if (tokenUriSimulationResponse) {
    tokenUri = scValToNative(tokenUriSimulationResponse.result?.retval as xdr.ScVal).toString()

    // Fetch and parse SEP-50 metadata from the token URI
    if (tokenUri) {
      const metadata: Sep50Metadata = await fetchSep50Metadata(tokenUri)

      // Extract all available fields from the metadata
      description = metadata.description || ''
      url = metadata.external_url || ''
      image = metadata.image || ''
      externalUrl = metadata.external_url || ''

      if (metadata.collection) {
        collection = {
          name: metadata.collection.name,
          family: metadata.collection.family,
        }
      }

      if (metadata.attributes) {
        attributes = metadata.attributes.map(attr => ({
          traitType: attr.trait_type,
          value: attr.value,
          displayType: attr.display_type,
          maxValue: attr.max_value,
        }))
      }
    }
  }

  return {
    symbol,
    name,
    description,
    url,
    image,
    externalUrl,
    collection,
    attributes,
    properties,
  }
}
