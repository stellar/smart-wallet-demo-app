import {
  // Account,
  // Address,
  Contract,
  // FeeBumpTransaction,
  // hash,
  Keypair,
  // Operation,
  rpc,
  // StrKey,
  // Transaction,
  TransactionBuilder,
  // xdr,
} from '@stellar/stellar-sdk'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { logger } from 'config/logger'
import { STELLAR } from 'config/stellar'

import { ERRORS } from './helpers/errors'
import { ISorobanService, SimulateContract, SimulationResult } from './types'

export default class Soroban extends SingletonBase implements ISorobanService {
  public rpcClient: rpc.Server
  public networkPassphrase: string
  public timeoutInSeconds: number
  public fee: string
  public sourceAccountKP: Keypair

  constructor() {
    super()
    this.rpcClient = new rpc.Server(STELLAR.SOROBAN_RPC_URL, {
      allowHttp: STELLAR.SOROBAN_RPC_URL.startsWith('http://'),
    })
    this.networkPassphrase = STELLAR.NETWORK_PASSPHRASE
    this.timeoutInSeconds = 60
    this.fee = STELLAR.MAX_FEE
    this.sourceAccountKP = Keypair.fromSecret(STELLAR.SOURCE_ACCOUNT.PRIVATE_KEY) // TODO: get account KP data with passkey
  }

  /**
   * Simulates a Soroban contract method.
   * @param contractId - The ID of the Soroban contract.
   * @param method - The method to call.
   * @param args - The arguments for the contract call.
   * @param signers - (Optional) Signers for the contract call.
   * @returns The transaction and simulation result.
   */
  public async simulateContract({
    contractId,
    method,
    args /* , signers */,
  }: SimulateContract): Promise<SimulationResult> {
    try {
      // Fetch source account
          logger.info(
      {
        input: {
            contractId,
            method,
            args
        }
      },
      `${this.constructor.name} | simulateContractMethod | Request Sent`
    )
      const sourceAcc = await this.rpcClient.getAccount(this.sourceAccountKP.publicKey()) // TODO: get account KP data with passkey

      // Initialize the contract
      const tokenContract = new Contract(contractId)
      const contractCallOp = tokenContract.call(method, ...args)

      // Build the transaction
      const tx = new TransactionBuilder(sourceAcc, { fee: this.fee })
        .addOperation(contractCallOp)
        .setTimeout(this.timeoutInSeconds)
        .setNetworkPassphrase(this.networkPassphrase)
        .build()

      const simulationResponse = await this.rpcClient.simulateTransaction(tx)
      if (!rpc.Api.isSimulationSuccess(simulationResponse)) {
        throw new Error(`${ERRORS.TX_SIM_FAILED} (simulation 1): ${simulationResponse}`)
      }

      // TODO: Sign the entries if signers are provided
      /* let authEntries: xdr.SorobanAuthorizationEntry[] = simulationResponse.result?.auth ?? [];
      if (signers && signers.length > 0) {
        tx = await this.signAuthEntries({
          authEntries,
          signers,
          tx,
          contractId,
        });

        // Simulate again after signing
        simulationResponse = (await this.rpcClient.simulateTransaction(tx)) as rpc.Api.SimulateTransactionSuccessResponse;
        if (!rpc.Api.isSimulationSuccess(simulationResponse)) {
          throw new Error(`${ERRORS.TX_SIM_FAILED} (simulation 2): ${simulationResponse}`);
        }
      } */

      return { tx, simulationResponse }
    } catch (error) {
    logger.info(
      {
        error
      },
      `${this.constructor.name} | simulateContractMethod | Request Failed`
    )
      throw error
    }
  }
}
