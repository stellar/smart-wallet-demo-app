import {
  Address,
  Contract,
  FeeBumpTransaction,
  Keypair,
  Operation,
  rpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'

import { Retryable } from 'api/core/framework/retryable/interface'
import { SingletonBase } from 'api/core/framework/singleton/interface'
import { logger } from 'config/logger'
import { STELLAR } from 'config/stellar'

import { AuthEntrySignerHelper } from './helpers/auth-entry-signer'
import { ERRORS } from './helpers/errors'
import { ScConvert } from './helpers/sc-convert'
import {
  ContractSigner,
  GenerateWebAuthnChallenge,
  ISorobanService,
  SignAuthEntries,
  SignAuthEntry,
  SimulateContractOperation,
  SimulationResult,
} from './types'

export default class SorobanService extends SingletonBase implements ISorobanService {
  public rpcClient: rpc.Server
  public networkPassphrase: string
  public timeoutInSeconds: number
  public fee: string
  public sourceAccountKeypair: Keypair

  constructor(sourceAccount?: { publicKey?: string; secretKey?: string }) {
    super()
    this.rpcClient = new rpc.Server(STELLAR.SOROBAN_RPC_URL, {
      allowHttp: STELLAR.SOROBAN_RPC_URL.startsWith('http://'),
      timeout: 30000, // 30 seconds
    })
    this.networkPassphrase = STELLAR.NETWORK_PASSPHRASE
    this.timeoutInSeconds = 60
    this.fee = STELLAR.MAX_FEE

    if (sourceAccount?.publicKey) this.sourceAccountKeypair = Keypair.fromPublicKey(sourceAccount.publicKey)
    if (sourceAccount?.secretKey) this.sourceAccountKeypair = Keypair.fromPublicKey(sourceAccount.secretKey)
    if (!sourceAccount) this.sourceAccountKeypair = Keypair.fromSecret(STELLAR.SOURCE_ACCOUNT.PRIVATE_KEY)
  }

  /**
   * Signs an authorization entry for a Soroban contract.
   *
   * @param contractId - The ID of the Soroban contract.
   * @param entry - The authorization entry to sign.
   * @param signer - The signer of the entry.
   * @returns A Promise that resolves to the signed Soroban authorization entry.
   * @throws An error if the signer is not authorized to sign the entry or if there is an error authorizing the entry.
   */
  public async signAuthEntry({ contractId, entry, signer }: SignAuthEntry): Promise<xdr.SorobanAuthorizationEntry> {
    this.logInfo('input', 'signAuthEntry', {
      contractId,
      entry,
      signer,
    })
    // Generate the auth entry options
    const generateAuthEntryOptions = await this.generateAuthEntryOptions({ contractId, entry, signer })

    // no-op if it's source account auth
    if (!generateAuthEntryOptions.validUntilLedgerSeq) return entry

    try {
      switch (signer.methodOptions.method) {
        case 'webauthn':
          return await new AuthEntrySignerHelper().authorizeEntryWithWebAuthn({
            entryOptions: {
              unsignedEntry: generateAuthEntryOptions.entry,
              validUntilLedgerSeq: generateAuthEntryOptions.validUntilLedgerSeq,
              networkPassphrase: this.networkPassphrase,
            },
            webAuthnOptions: signer.methodOptions.options,
          })
        case 'keypair':
          return await new AuthEntrySignerHelper().authorizeEntryWithKeypair({
            entryOptions: {
              unsignedEntry: generateAuthEntryOptions.entry,
              validUntilLedgerSeq: generateAuthEntryOptions.validUntilLedgerSeq,
              networkPassphrase: this.networkPassphrase,
            },
            keypairOptions: signer.methodOptions.options,
          })
        default:
          throw new Error(ERRORS.INVALID_SIGNER_METHOD)
      }
    } catch (error) {
      this.logError('signAuthEntry', { error })
      throw new Error(ERRORS.UNABLE_TO_AUTHORIZE_ENTRY)
    }
  }

  /**
   * Signs all authorization entries for a Soroban contract.
   *
   * @param contractId - The ID of the Soroban contract.
   * @param tx - The transaction that will be updated with the signed entries.
   * @param simulationResponse - The simulation response containing the authorization entries.
   * @param signers - The signers that will sign the entries.
   * @returns A Promise that resolves to the signed Soroban transaction.
   */
  public async signAuthEntries({ contractId, tx, simulationResponse, signers }: SignAuthEntries): Promise<Transaction> {
    this.logInfo('input', 'signAuthEntries', {
      contractId,
      tx,
      simulationResponse,
      signers,
    })

    const authEntries: xdr.SorobanAuthorizationEntry[] = simulationResponse.result?.auth ?? []
    const signedEntries: xdr.SorobanAuthorizationEntry[] = []

    // Create a Map to index signers by their addressId
    const signerMap = new Map<string, ContractSigner>()
    for (const signer of signers) {
      signerMap.set(signer.addressId, signer)
    }

    for (const entry of authEntries) {
      // no-op if it's source account auth
      if (entry.credentials().switch().value !== xdr.SorobanCredentialsType.sorobanCredentialsAddress().value) continue

      const entryAddress = ScConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address())
      const signer = signerMap.get(entryAddress.id)

      if (signer) {
        signedEntries.push(
          await this.signAuthEntry({
            entry,
            signer,
            contractId,
          })
        )
      }
    }

    // Soroban transaction can only have 1 operation
    const rawInvokeHostFunctionOp = tx.operations[0] as Operation.InvokeHostFunction
    const clonedTx = TransactionBuilder.cloneFrom(tx)
      .clearOperations()
      .addOperation(
        Operation.invokeHostFunction({
          ...rawInvokeHostFunctionOp,
          auth: signedEntries,
        })
      )
      .build()

    this.logInfo('result', 'signAuthEntries', {
      clonedTx,
    })

    return clonedTx
  }

  /**
   * Simulates a Soroban contract method.
   * @param contractId - The ID of the Soroban contract.
   * @param simulationResponse - The simulation response containing the authorization entries.
   * @param signer - The signer of the contract call.
   * @returns The transaction and simulation result.
   */
  public async generateWebAuthnChallenge({
    contractId,
    simulationResponse,
    signer,
  }: GenerateWebAuthnChallenge): Promise<string> {
    try {
      this.logInfo('input', 'generateWebAuthnChallengeFromContract', {
        input: {
          contractId,
          simulationResponse,
          signer,
        },
      })
      const authEntries: xdr.SorobanAuthorizationEntry[] = simulationResponse.result?.auth ?? []

      // Check if the signer address is in the auth entries
      const validAuthEntry = authEntries.find(entry => {
        const entryAddress = ScConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address())
        return entryAddress.id === signer.addressId // user.contractAddress
      })

      if (!validAuthEntry) {
        throw new Error(ERRORS.INVALID_SIGNER_ADDRESS)
      }

      // Generate the auth entry options
      const generateAuthEntryOptions = await this.generateAuthEntryOptions({
        contractId,
        entry: validAuthEntry,
        signer,
      })

      if (!generateAuthEntryOptions.validUntilLedgerSeq) {
        throw new Error(ERRORS.INVALID_VALID_UNTIL_LEDGER_SEQ)
      }

      // Generate the webauthn challenge
      const challenge = await new AuthEntrySignerHelper().generateWebAuthnChallenge({
        entryOptions: {
          unsignedEntry: generateAuthEntryOptions.entry,
          validUntilLedgerSeq: generateAuthEntryOptions.validUntilLedgerSeq,
          networkPassphrase: this.networkPassphrase,
        },
      })

      this.logInfo('result', 'generateWebAuthnChallengeFromContract', { challenge })
      return challenge
    } catch (error) {
      this.logError('generateWebAuthnChallengeFromContract', { error })
      throw error
    }
  }

  private async generateAuthEntryOptions({
    contractId,
    entry,
    signer,
  }: Pick<SignAuthEntry, 'contractId' | 'entry'> & { signer: { addressId: string } }): Promise<{
    entry: xdr.SorobanAuthorizationEntry
    validUntilLedgerSeq?: number
  }> {
    // Ensure the signer is authorized to sign the entry
    const entryAddress = ScConvert.sorobanEntryAddressFromScAddress(entry.credentials().address().address())
    if (signer.addressId !== entryAddress.id) {
      throw new Error(`${ERRORS.INVALID_SIGNER}: ${signer.addressId}`)
    }

    // Construct the ledger key
    const ledgerKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: new Address(contractId).toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      })
    )

    // Fetch the current contract ledger seq
    let validUntilLedgerSeq = 0
    const entryRes = await Retryable.retry(() => this.rpcClient.getLedgerEntries(ledgerKey))
    if (entryRes.entries && entryRes.entries.length) {
      // set auth entry to expire when contract data expires, but could any number of blocks in the future
      validUntilLedgerSeq = entryRes.entries[0].liveUntilLedgerSeq || 0
    } else {
      throw new Error(ERRORS.CANNOT_FETCH_LEDGER_ENTRY)
    }

    // If validUntilLedgerSeq still 0, set auth entry to expire in 10000 blocks
    if (!validUntilLedgerSeq) {
      validUntilLedgerSeq = (await this.rpcClient.getLatestLedger()).sequence + 10000
    }

    return { entry, validUntilLedgerSeq }
  }

  /**
   * Simulates a Soroban contract method.
   * @param contractId - The ID of the Soroban contract.
   * @param method - The method to call.
   * @param args - The arguments for the contract call.
   * @param signers - (Optional) Signers for the contract call.
   * @returns The transaction and simulation result.
   */
  public async simulateContractOperation({
    contractId,
    method,
    args,
    signers,
  }: SimulateContractOperation): Promise<SimulationResult> {
    try {
      this.logInfo('input', 'simulateContract', {
        input: {
          contractId,
          method,
          args,
          signers,
        },
      })
      // Fetch source account
      const sourceAcc = await Retryable.retry(() => this.rpcClient.getAccount(this.sourceAccountKeypair.publicKey()))

      // Initialize the contract
      const tokenContract = new Contract(contractId)
      const contractCallOp = tokenContract.call(method, ...args)
      contractCallOp.sourceAccount(xdr.MuxedAccount.keyTypeEd25519(this.sourceAccountKeypair.rawPublicKey()))

      // Build the transaction
      let tx = new TransactionBuilder(sourceAcc, { fee: this.fee })
        .addOperation(contractCallOp)
        .setTimeout(this.timeoutInSeconds)
        .setNetworkPassphrase(this.networkPassphrase)
        .build()

      this.logInfo('result', 'transaction XDR', { tx: tx.toXDR() })

      let simulationResponse = await this.simulateTransaction(tx)

      // Add signed auth entries if signers are provided
      if (signers && signers.length > 0) {
        tx = await this.signAuthEntries({
          contractId,
          tx,
          simulationResponse,
          signers,
        })

        // Simulate again after signing
        simulationResponse = await this.simulateTransaction(tx)
      }

      this.logInfo('result', 'simulateContract', {
        result: {
          tx,
          simulationResponse,
        },
      })
      return {
        tx,
        simulationResponse,
      }
    } catch (error) {
      this.logError('simulateContract', { error })
      throw error
    }
  }

  /**
   * Simulates a transaction using the Stellar network.
   * @param tx - The transaction to simulate.
   * @returns A Promise that resolves to the simulation result.
   * @throws {Error} If the simulation fails.
   */
  public async simulateTransaction(tx: Transaction): Promise<rpc.Api.SimulateTransactionSuccessResponse> {
    const simulationResponse = (await Retryable.retry(() =>
      this.rpcClient.simulateTransaction(tx)
    )) as rpc.Api.SimulateTransactionSuccessResponse
    if (!rpc.Api.isSimulationSuccess(simulationResponse)) {
      this.logError('simulateTransaction', { context: { xdr: tx.toXDR(), simulationResponse } })
      throw new Error(ERRORS.TX_SIM_FAILED)
    }

    return simulationResponse
  }

  /**
   * Signs a transaction using the source account keypair.
   *
   * @param tx - The transaction to sign, which can be a Transaction object,
   * a FeeBumpTransaction object, or an XDR string representation of the transaction.
   * @returns A Promise that resolves to the signed Transaction or FeeBumpTransaction.
   */

  public async signTransactionWithSourceAccount(
    tx: Transaction | FeeBumpTransaction | string
  ): Promise<Transaction | FeeBumpTransaction> {
    if (typeof tx === 'string') {
      tx = TransactionBuilder.fromXDR(tx, this.networkPassphrase)
    }
    tx.sign(this.sourceAccountKeypair)
    return tx
  }

  /**
   * Sends a transaction to the Stellar network.
   * @param tx - The transaction to submit, either as a Transaction object, FeeBumpTransaction object, or an XDR string.
   * @returns A Promise that resolves to the transaction response from the network.
   * @throws If the transaction submission fails.
   */
  public async sendTransaction(
    tx: Transaction | FeeBumpTransaction | string
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
    if (typeof tx === 'string') {
      tx = TransactionBuilder.fromXDR(tx, this.networkPassphrase)
    }

    // Send the transaction
    const sendResponse = await Retryable.retry(() => this.rpcClient.sendTransaction(tx))
    if (sendResponse.errorResult) {
      this.logError('sendTransaction', { context: { sendResponse } })
      throw new Error(ERRORS.SUBMIT_TX_FAILED)
    }

    // Poll for transaction status
    let txResponse = await Retryable.retry(() => this.rpcClient.getTransaction(sendResponse.hash))
    while (txResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
      txResponse = await Retryable.retry(() => this.rpcClient.getTransaction(sendResponse.hash))
    }

    // Check if transaction succeeded
    if (txResponse.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return txResponse
    }

    this.logError('sendTransaction', { context: { txResponse } })
    throw new Error(ERRORS.SUBMIT_TX_FAILED)
  }

  /**
   * Logs an info message for the given type.
   *
   * @param type - The type of log message.
   * @param method - The name of the method that generated the log message.
   * @param data - The data to log.
   */
  private logInfo(type: 'input' | 'result', method: string, data: Record<string, unknown>): void {
    logger.info(
      {
        ...data,
      },
      `${this.constructor.name} | ${method} | ${type === 'input' ? 'Input Received' : 'Result'}`
    )
  }

  /**
   * Logs an error message for the given method.
   *
   * @param method - The name of the method that generated the error log message.
   * @param data - The error data to log.
   */

  private logError(method: string, data: Record<string, unknown>): void {
    logger.info(
      {
        ...data,
      },
      `${this.constructor.name} | ${method} | Error`
    )
  }
}
