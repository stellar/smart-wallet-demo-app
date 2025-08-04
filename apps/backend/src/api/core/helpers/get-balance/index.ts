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
  assetRepository,
  sorobanService,
}: {
  userContractAddress: string
  assetRepository?: AssetRepositoryType
  sorobanService?: ISorobanService
}): Promise<number> => {
  const assetRepositoryInstance = assetRepository || AssetRepository.getInstance()
  const sorobanServiceInstance = sorobanService || SorobanService.getInstance()
  // Get asset contract address from db
  const asset = await assetRepositoryInstance.getAssetByType('native') // Stellar/XLM native asset
  const assetContractAddress = asset?.contractAddress ?? STELLAR.TOKEN_CONTRACT.NATIVE

  const { simulationResponse } = await sorobanServiceInstance.simulateContract({
    contractId: assetContractAddress, // TODO: get balance for another assets?
    method: 'balance',
    args: [ScConvert.accountIdToScVal(userContractAddress)],
  } as SimulateContract)

  const walletBalance: number = Number(ScConvert.scValToFormatString(simulationResponse.result?.retval as xdr.ScVal))
  return walletBalance
}
