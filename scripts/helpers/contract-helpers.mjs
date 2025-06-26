import * as StellarSDK from '@stellar/stellar-sdk'
import fs from 'fs'
import debug from 'debug'

const log = debug('deploy-cli:contract-helpers')

export function getServer(production = false) {
  if (production) {
    return new StellarSDK.rpc.Server('https://mainnet.sorobanrpc.com:443')
  }
  return new StellarSDK.rpc.Server('https://soroban-testnet.stellar.org:443')
}

/**
 * Builds a transaction with the given operations and sends it to the Stellar
 * testnet network.
 *
 * @param {StellarSDK.Account} account - The account to build the transaction
 * from.
 * @param {StellarSDK.Operation[]} operations - The operations to include in the
 * transaction.
 *  @param {StellarSDK.Keypair} sourceKeypair - The keypair of the account that
 * will sign the transaction.
 * @param {StellarSDK.rpc.Server} server - The Stellar server instance to use for sending the transaction.
 * @returns {Promise<StellarSDK.rpc.Api.SendTransactionResponse>} - A promise that resolves
 * with the transaction response from the network if the transaction is
 * successful, or rejects with an error if the transaction fails.
 */
async function buildAndSendTransaction(account, operations, sourceKeypair, server) {
  const transaction = new StellarSDK.TransactionBuilder(account, {
    fee: StellarSDK.BASE_FEE,
    networkPassphrase: StellarSDK.Networks.TESTNET,
  })
    .addOperation(operations)
    .setTimeout(30)
    .build()

  const tx = await server.prepareTransaction(transaction)
  tx.sign(sourceKeypair)

  log('⚠️ Sending transaction ⚠️')
  let response = await server.sendTransaction(tx)
  const hash = response.hash
  log(`⚠️ Transaction sent with hash: ${hash}. Waiting for confirmation... ⚠️`)

  while (true) {
    response = await server.getTransaction(hash)
    if (response.status !== 'NOT_FOUND') {
      break
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (response.status === 'SUCCESS') {
    log('✅ Transaction Successful ✅')
    return response
  } else {
    log('🚨 Transaction Failed Failed 🚨')
    throw new Error('Transaction failed')
  }
}

/**
 * Deploys the contract to the Stellar testnet.
 *
 * @param {StellarSDK.xdr.OperationResult} response - The result from the
 * uploadContractWasm operation.
 * @param {string} secretKey - The secret key of the account that will deploy
 * @param {string} name - The name of the contract.
 * @param {string} symbol - The symbol of the contract.
 * @param {string} uri - The URI for the contract metadata.
 * @param {number} supply - The total supply of the contract.
 *  @param {boolean} production - Whether to use the production network
 * @returns {Promise<string>} - A promise that resolves with the contract
 * address as a string.
 */
export async function deployContract(response, secretKey, name, symbol, uri, supply, production = false) {
  const server = getServer(production)

  log('⚠️ Deploying contract to the Stellar ⚠️')
  const sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey)
  const account = await server.getAccount(sourceKeypair.publicKey())

  const scAddress = StellarSDK.Address.fromString(sourceKeypair.publicKey()).toScAddress()
  const ownerVal = StellarSDK.xdr.ScVal.scvAddress(scAddress)

  const operation = StellarSDK.Operation.createCustomContract({
    wasmHash: response.returnValue.bytes(),
    address: StellarSDK.Address.fromString(sourceKeypair.publicKey()),
    salt: response.hash,
    constructorArgs: [
      ownerVal,
      StellarSDK.xdr.ScVal.scvString(name),
      StellarSDK.xdr.ScVal.scvString(symbol),
      StellarSDK.xdr.ScVal.scvString(uri),
      StellarSDK.xdr.ScVal.scvI32(supply),
    ],
  })

  log('⚠️ Building and sending transaction to deploy contract ⚠️')

  const responseDeploy = await buildAndSendTransaction(account, operation, sourceKeypair, server)
  const contractAddress = StellarSDK.StrKey.encodeContract(
    StellarSDK.Address.fromScAddress(responseDeploy.returnValue.address()).toBuffer()
  )

  log(`✅ Contract deployed successfully at address: ${contractAddress} ✅`)

  return contractAddress
}

/**
 * Deploy the WASM contract to the Stellar testnet.
 *
 * @param {string} contractPath - The path to the contract WASM file.
 * @param {string} secretKey - The path to the contract WASM file.
 *
 * @returns {Promise<void>} - Resolves if the transaction is successful, rejects
 *                            otherwise.
 */
export async function uploadWasm(contractPath, secretKey, production = false) {
  log('⚠️ Uploading contract WASM to Stellar ⚠️')
  const server = getServer(production)

  const rootDir = process.cwd()
  const bytecode = fs.readFileSync(`${rootDir}/${contractPath}`)
  const sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey)
  const account = await server.getAccount(sourceKeypair.publicKey())
  const operation = StellarSDK.Operation.uploadContractWasm({ wasm: bytecode })

  log('⚠️ Building and sending transaction to upload contract WASM ⚠️')

  return await buildAndSendTransaction(account, operation, sourceKeypair, server)
}

/**
 * @name updateContractMetadataURI
 * @description Updates the contract metadata URI on the Stellar deployed contract.
 *
 * @param {string} secretKey
 * @param {string} contractAddress
 * @param {string} uri
 * @returns {Promise<StellarSDK.rpc.Api.SendTransactionResponse>}
 */
export async function updateContractMetadataURI(secretKey, contractAddress, uri, production = false) {
  log('⚠️ Updating contract with IPFS Metadatas URI ⚠️')
  const server = getServer(production)

  const sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey)
  const account = await server.getAccount(sourceKeypair.publicKey())

  const invokeOp = StellarSDK.Operation.invokeContractFunction({
    contract: contractAddress,
    function: 'update_uri',
    args: [StellarSDK.xdr.ScVal.scvString(uri)],
  })

  log('⚠️ Building and sending transaction to update contract metadata URI ⚠️')

  return await buildAndSendTransaction(account, invokeOp, sourceKeypair, server)
}
