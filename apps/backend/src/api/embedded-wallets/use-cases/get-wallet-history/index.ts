import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { extractOperationData } from 'api/core/helpers/xdr-extractor'
import AssetRepository from 'api/core/services/asset'
import UserRepository from 'api/core/services/user'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
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

  constructor(
    userRepository?: UserRepositoryType,
    assetRepository?: AssetRepositoryType,
    vendorRepository?: VendorRepositoryType,
    walletBackend?: WalletBackend
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
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
    const walletHistory = await this.walletBackend.getTransactions({ address: user.contractAddress })

    const transactions: TransactionSchemaT[] = []

    for (const tx of walletHistory.account?.transactions ?? []) {
      if (tx.operations[0].stateChanges.length === 0) {
        continue // Skip non-transfer transactions (like contract creation, etc.)
      }

      // Fetch asset details using the tokenId from the transaction
      const asset = await this.assetRepository.getAssetByContractAddress(tx.operations[0].stateChanges[0].tokenId)

      // extract transaction addresses from operation XDR
      const operationData = extractOperationData(xdr.Operation.fromXDR(tx.operations[0].operationXdr, 'base64'))

      // If the operation data is not available, skip this transaction
      const fromAddress = operationData?.functionArgs ? (operationData.functionArgs[0] as FunctionArg).value : undefined
      const toAddress = operationData?.functionArgs ? (operationData.functionArgs[1] as FunctionArg).value : undefined

      const vendorContractAddress = operationData?.functionArgs
        ? (operationData.functionArgs[1] as FunctionArg).value
        : undefined
      const vendor = vendorContractAddress
        ? await this.vendorRepository.getVendorByWalletAddress(vendorContractAddress)
        : undefined

      const transaction: TransactionSchemaT = {
        hash: tx.hash,
        type: tx.operations[0].stateChanges[0].stateChangeCategory,
        vendor: vendor?.name || vendorContractAddress || 'Unknown vendor',
        amount: Number(ScConvert.stringToFormatString(tx.operations[0].stateChanges[0].amount)), // Assuming amount is in the smallest unit (like stroops for XLM)
        asset: asset?.code || tx.operations[0].stateChanges[0].tokenId,
        date: tx.ledgerCreatedAt, // Assuming ledgerCreatedAt is in ISO format
      }

      if (fromAddress) {
        transaction.fromAddress = fromAddress
      }
      if (toAddress) {
        transaction.toAddress = toAddress
      }

      transactions.push(transaction)
    }

    // Parse the response to match the expected schema
    const parsedResponse: ResponseSchemaT['data'] = {
      transactions: transactions,
    }
    return this.parseResponse(parsedResponse)
  }
}

export { endpoint }
