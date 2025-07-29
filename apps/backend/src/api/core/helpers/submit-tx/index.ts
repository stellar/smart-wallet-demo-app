/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Keypair, rpc, Transaction, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

import { getValueFromEnv } from 'config/env-utils'
import { STELLAR } from 'config/stellar'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { SimulationResponse, WalletBackendType } from 'interfaces/wallet-backend/types'

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

  const preparedTransaction = rpc.assembleTransaction(tx, simulationResponse)
  tx = preparedTransaction.build()

  const transactionEnvelope = xdr.TransactionEnvelope.fromXDR(tx.toXDR(), 'base64')
  const operationXDRs = transactionEnvelope
    .v1()
    .tx()
    .operations()
    .map(op => op.toXDR('base64')) // Convert each operation to XDR
  const timeout = 30 // seconds

  // Build the transaction on the wallet backend
  const buildTxResponse = await walletBackendInstance.buildTransaction({
    transactions: [
      { operations: operationXDRs, timeout, simulationResult: refineSimulationResponse(simulationResponse) },
    ],
  })

  // Sign the transaction with Soroban source account
  const builtTx = TransactionBuilder.fromXDR(
    buildTxResponse.transactionXdrs[0],
    getValueFromEnv('STELLAR_NETWORK_PASSPHRASE')
  )
  builtTx.sign(Keypair.fromSecret(STELLAR.SOURCE_ACCOUNT.PRIVATE_KEY))

  // Wrap the transaction in a fee bump transaction
  const feeBumpedTxResponse = await walletBackendInstance.createFeeBumpTransaction({
    transaction: builtTx.toXDR(),
  })

  // Send the final XDR transaction
  const rpcTxResponse = await sorobanServiceInstance.sendTransaction(feeBumpedTxResponse.transaction)

  return rpcTxResponse
}

const refineSimulationResponse = (
  rpcSimulationResponse: rpc.Api.SimulateTransactionSuccessResponse
): SimulationResponse => {
  const events = rpcSimulationResponse.events.map(xdrEvent => xdrEvent.toXDR('base64'))
  const results = [
    {
      xdr: rpcSimulationResponse.result!.retval.toXDR('base64'),
      auth: rpcSimulationResponse.result!.auth.map(xdrAuth => xdrAuth.toXDR('base64')),
    },
  ]
  const stateChanges = rpcSimulationResponse.stateChanges?.map(xdrStateChange => ({
    type: `${xdrStateChange.type}`,
    key: xdrStateChange.key.toXDR('base64'),
    before: xdrStateChange.before?.toXDR('base64'),
    after: xdrStateChange.after?.toXDR('base64'),
  }))
  const transactionData = rpcSimulationResponse.transactionData.build().toXDR('base64')
  return {
    events,
    latestLedger: rpcSimulationResponse.latestLedger,
    minResourceFee: rpcSimulationResponse.minResourceFee,
    results,
    stateChanges,
    transactionData,
  }
}
