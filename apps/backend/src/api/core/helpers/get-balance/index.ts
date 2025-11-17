/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { xdr } from '@stellar/stellar-sdk'

import { Asset, AssetRepositoryType } from 'api/core/entities/asset/types'
import AssetRepository from 'api/core/services/asset'
import { STELLAR } from 'config/stellar'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, SimulateContractOperation } from 'interfaces/soroban/types'

export const getWalletBalance = async ({
  userContractAddress,
  assetType,
  assetCode, // Symbol
  assetContract, // Asset contract address
  assetRepository,
  sorobanService,
  isToken,
}: {
  userContractAddress: string
  assetType?: string
  assetCode?: string
  assetContract?: string
  assetRepository?: AssetRepositoryType
  sorobanService?: ISorobanService
  isToken?: boolean
}): Promise<number> => {
  const assetRepositoryInstance = assetRepository || AssetRepository.getInstance()
  const sorobanServiceInstance = sorobanService || SorobanService.getInstance()

  // Get asset contract address
  let asset: Asset | null = null
  let assetContractAddress: string | null = null

  if (assetType) {
    asset = await assetRepositoryInstance.getAssetByType(assetType as string)
  } else if (assetCode) {
    asset = await assetRepositoryInstance.getAssetByCode(assetCode as string)
  }

  if (assetContractAddress === null) {
    assetContractAddress = assetContract || asset?.contractAddress || STELLAR.TOKEN_CONTRACT.NATIVE
  }

  /**
   * Get balance via simulation call
   * In conformity with Stellar standard assets specs (CAP-46-06), as with NFT specs (SEP-39 and SEP-50)
   */
  // TODO: adapt to another assets specs in the future
  const { simulationResponse } = await sorobanServiceInstance.simulateContractOperation({
    contractId: assetContractAddress,
    method: 'balance',
    args: [ScConvert.accountIdToScVal(userContractAddress)],
  } as SimulateContractOperation)

  let balance: number

  if (isToken) {
    balance = Number(ScConvert.scValToString(simulationResponse.result?.retval as xdr.ScVal))
  } else {
    balance = Number(ScConvert.scValToFormatString(simulationResponse.result?.retval as xdr.ScVal))
  }

  return balance
}
