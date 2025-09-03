import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { VendorRepositoryType } from 'api/core/entities/vendor/types'
import { ProductRepositoryType } from 'api/core/entities/product/types'
import { NgoRepositoryType } from 'api/core/entities/ngo/types'
import { NftSupplyRepositoryType } from 'api/core/entities/nft-supply/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { extractOperationData } from 'api/core/helpers/xdr-extractor'
import AssetRepository from 'api/core/services/asset'
import UserRepository from 'api/core/services/user'
import VendorRepository from 'api/core/services/vendor'
import ProductRepository from 'api/core/services/product'
import NgoRepository from 'api/core/services/ngo'
import NftSupplyRepository from 'api/core/services/nft-supply'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import WalletBackend from 'interfaces/wallet-backend'

import { TransactionSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT, FunctionArg } from './types'

const endpoint = '/tx-history'

export class GetWalletHistory extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private walletBackend: WalletBackend
  private userRepository: UserRepositoryType
  private assetRepository: AssetRepositoryType
  private vendorRepository: VendorRepositoryType
  private productRepository: ProductRepositoryType
  private ngoRepository: NgoRepositoryType
  private nftSupplyRepository: NftSupplyRepositoryType

  constructor(
    userRepository?: UserRepositoryType,
    assetRepository?: AssetRepositoryType,
    vendorRepository?: VendorRepositoryType,
    walletBackend?: WalletBackend,
    productRepository?: ProductRepository,
    ngoRepository?: NgoRepository,
    nftSupplyRepository?: NftSupplyRepository,
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
    this.productRepository = productRepository || ProductRepository.getInstance()
    this.ngoRepository = ngoRepository || NgoRepository.getInstance()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { id: request.userData?.userId } as RequestSchemaT
    if (!payload.id) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(response: ResponseSchemaT['data']): ResponseSchemaT {
    return {
      data: {
        ...response,
      },
      message: 'Transaction history retrieved successfully',
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)

    // Check if user exists (should not be necessary, but added for safety)
    const user = await this.userRepository.getUserById(validatedData.id)
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_ID)
    }

    // Return empty array if user does not have a wallet
    if (!user.contractAddress) return this.parseResponse({ transactions: [] })

    // Fetch tx history from wallet backend service
    const transactions: TransactionSchemaT[] = await this.getWalletHistoryByAddress(user.contractAddress as string)

    // Parse the response to match the expected schema
    const parsedResponse: ResponseSchemaT['data'] = {
      transactions: transactions,
    }
    return this.parseResponse(parsedResponse)
  }

  public async getWalletHistoryByAddress(address: string): Promise<TransactionSchemaT[]> {
    // Fetch tx history from wallet backend service
    const walletHistory = await this.walletBackend.getTransactions({ address })

    const transactions: TransactionSchemaT[] = []

    for (const tx of walletHistory.account?.transactions ?? []) {
      if (
        // tx.operations[0].stateChanges.length === 0 ||
        tx.operations[0].stateChanges[0]?.stateChangeReason == 'DEPLOY' // TODO: Handle other state change reasons if necessary
      ) {
        continue // Skip non-transfer transactions (like contract creation, deploy, etc.)
      }

      // extract transaction addresses from operation XDR
      const operationData = extractOperationData(xdr.Operation.fromXDR(tx.operations[0].operationXdr, 'base64'))

      console.log('OPERATION DATA >>>', operationData)

      // Determine contract invoked function name, defaulting to 'transfer' if not found
      const functionName = tx.operations[0].stateChanges[0]?.stateChangeCategory || operationData?.functionName || 'transfer'

      // Fetch asset details using the tokenId from the transaction
      const contractId = tx.operations[0].stateChanges[0]?.tokenId || operationData?.contractId
      const asset = await this.assetRepository.getAssetByContractAddress(contractId as string)

      // Try to extract 'from' and 'to' addresses from function args
      let fromAddress, toAddress: string | undefined
      if (operationData.functionArgs) {

        if (functionName.includes('mint')) {
          toAddress = operationData?.functionArgs ? (operationData.functionArgs[0] as FunctionArg)?.value : undefined
        } else if (operationData.functionArgs[0] && operationData.functionArgs[1]) {
          fromAddress = operationData?.functionArgs ? (operationData.functionArgs[0] as FunctionArg)?.value : undefined
          toAddress = operationData?.functionArgs ? (operationData.functionArgs[1] as FunctionArg)?.value : undefined
        } else if (operationData.functionArgs[0] && !operationData.functionArgs[1]) {
           // in the case of some function like 'mint', there is only one address (the destination)
          toAddress = operationData?.functionArgs ? (operationData.functionArgs[0] as FunctionArg)?.value : undefined
        }
      }

      const vendorContractAddress = operationData?.functionArgs
        ? (operationData.functionArgs[1] as FunctionArg)?.value
        : undefined

      let vendor
      if (vendorContractAddress) {
        vendor = vendorContractAddress
          ? await this.vendorRepository.getVendorByWalletAddress(vendorContractAddress)
          : undefined
      }

      // Check if the asset is linked to any swag products
      let swagProducts
      if (asset) {
        swagProducts = await this.productRepository.getSwagProducts({
          where: { asset: { assetId: asset?.assetId } },
        })
      }
      
      // Check if the transaction destination is linked to any NGOs
      let ngo
      if (toAddress) {
        ngo = await this.ngoRepository.getNgoByWalletAddress(toAddress)
      }

      // Check if contract address is linked to any NFT collection
      let nftSupply
      if (operationData.contractId) {
        nftSupply = await this.nftSupplyRepository.getNftSupplyByContractAddress(operationData.contractId as string)
      }

      let type = functionName.includes('mint') ? 'nft_claim' : functionName // default nft_claim if function name indicates minting
      
      // Set the transaction type based on known criteria
      if (operationData.contractId === STELLAR.AIRDROP_CONTRACT_ADDRESS) {
        type = 'airdrop_claim'
      }
      else if (ngo) {
        type = 'donation'
      }
      else if (swagProducts && swagProducts.length > 0) { 
        type = 'swag'
      } else if (nftSupply) {
        if (functionName === 'transfer') type = 'nft'
        else if (functionName === 'mint' || functionName === 'mint_with_data') type = 'nft_claim'
      }

      // TODO: get amount in NFT transactions (number of NFTs transferred). Fallback to 1 for now
      const amount = tx.operations[0].stateChanges[0]?.amount ? Number(ScConvert.stringToFormatString(tx.operations[0].stateChanges[0]?.amount)) : 1

      const transaction: TransactionSchemaT = {
        hash: tx.hash,
        type: type,
        vendor: vendor?.name || vendorContractAddress || 'Unknown vendor',
        amount: amount,
        asset: asset?.code || tx.operations[0].stateChanges[0]?.tokenId || contractId as string,
        date: tx.ledgerCreatedAt, // Assuming ledgerCreatedAt is in ISO format
      }

      if ((type === 'nft' || type === 'nft_claim') && nftSupply) {
        transaction.token = {
          contract_address: nftSupply?.contractAddress || operationData.contractId as string,
          name: nftSupply?.name,
          description: nftSupply?.description,
          symbol: nftSupply?.code,
          image_url: nftSupply?.url,
          session_id: nftSupply?.sessionId,
          resource: nftSupply?.resource,
        }
      }

      // TODO: add product details to the transaction, in the case of sell product transactions

      if (fromAddress) {
        transaction.fromAddress = fromAddress
        transaction.sendOrReceive = fromAddress == address ? 'send' : 'receive'
      }
      if (toAddress) {
        transaction.toAddress = toAddress
        transaction.sendOrReceive = toAddress == address ? 'receive' : 'send'
      }

      transactions.push(transaction)
    }

    return transactions
  }
}

export { endpoint }
