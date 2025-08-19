import { rpc, Transaction } from '@stellar/stellar-sdk'

import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { buildTx } from '../build-tx'

export const submitTx = async ({
  tx,
  simulationResponse,
  walletBackend,
  sorobanService,
}: {
  tx: Transaction
  simulationResponse: rpc.Api.SimulateTransactionSuccessResponse
  walletBackend?: WalletBackendType
  sorobanService?: ISorobanService
}): Promise<rpc.Api.GetSuccessfulTransactionResponse> => {
  const walletBackendInstance = walletBackend || WalletBackend.getInstance()
  const sorobanServiceInstance = sorobanService || SorobanService.getInstance()

  // Build the transaction using the wallet backend
  const builtTx = await buildTx({
    tx,
    simulationResponse,
    walletBackend: walletBackendInstance,
  })

  // Sign the transaction with Soroban source account
  const signedTx = await sorobanServiceInstance.signTransactionWithSourceAccount(builtTx)

  // Wrap the transaction in a fee bump transaction
  const feeBumpedTxResponse = await walletBackendInstance.createFeeBumpTransaction({
    transaction: signedTx.toXDR(),
  })

  // Send the final XDR transaction
  const rpcTxResponse = await sorobanServiceInstance.sendTransaction(feeBumpedTxResponse.transaction)

  return rpcTxResponse
}
