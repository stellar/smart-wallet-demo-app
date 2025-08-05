/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { xdr } from '@stellar/stellar-sdk'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import AssetRepository from 'api/core/services/asset'
import { STELLAR } from 'config/stellar'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, SimulateContract } from 'interfaces/soroban/types'

export const getWalletBalance = async ({
  userContractAddress,
  assetType,
  assetCode,
  assetRepository,
  sorobanService,
}: {
  userContractAddress: string
  assetType?: string
  assetCode?: string
  assetRepository?: AssetRepositoryType
  sorobanService?: ISorobanService
}): Promise<number> => {
  const assetRepositoryInstance = assetRepository || AssetRepository.getInstance()
  const sorobanServiceInstance = sorobanService || SorobanService.getInstance()

  // Get asset contract address
  const asset =
    assetType || assetCode
      ? await assetRepositoryInstance.getAssetByType(assetType as string)
      : await assetRepositoryInstance.getAssetByCode(assetCode as string)

  const assetContractAddress = asset?.contractAddress ?? STELLAR.TOKEN_CONTRACT.NATIVE // Stellar/XLM native asset

  /**
   * Get balance via simulation call
   * In conformity with Stellar standard assets specs, as with NFT specs (SEP-39 and SEP-50)
   */
  // TODO: adapt to another assets specs in the future
  const { simulationResponse } = await sorobanServiceInstance.simulateContract({
    contractId: assetContractAddress,
    method: 'balance',
    args: [ScConvert.accountIdToScVal(userContractAddress)],
  } as SimulateContract)

  const walletBalance: number = Number(ScConvert.scValToFormatString(simulationResponse.result?.retval as xdr.ScVal))
  return walletBalance
}
