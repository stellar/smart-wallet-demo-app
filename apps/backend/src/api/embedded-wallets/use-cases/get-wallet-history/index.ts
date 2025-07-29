import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import AssetRepository from 'api/core/services/asset'
import UserRepository from 'api/core/services/user'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import WalletBackend from 'interfaces/wallet-backend'

import { TransactionSchemaT, ParseSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

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
      throw new UnauthorizedException('Not authorized')
    }
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  parseResponse(response: ParseSchemaT): ResponseSchemaT {
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
      throw new ResourceNotFoundException(`User with id ${validatedData.id} not found`)
    }

    // Fetch tx history from wallet backend service
    const walletHistory = await this.walletBackend.getTransactions({ address: user.contractAddress as string })

    const transactions: TransactionSchemaT[] = []

    for (const tx of walletHistory.account?.transactions ?? []) {
      const asset = await this.assetRepository.getAssetByContractAddress(tx.operations[0].stateChanges[0].tokenId)

      // TODO: Fetch vendor contractAddress from operation XDR
      const vendorContractAddress = 'GAC5HOBF4VUBV76Z3DAHQVPJZXKAEJMPAU75C4QJFXBHJ5H3PS4DFAUB' // Placeholder for vendor contract address
      const vendor = await this.vendorRepository.getVendorByContractAddress(vendorContractAddress)

      transactions.push({
        hash: tx.hash,
        type: tx.operations[0].stateChanges[0].stateChangeCategory,
        vendor: vendor?.name || vendorContractAddress, // TODO: get vendor data from db
        amount: tx.operations[0].stateChanges[0].amount,
        asset: asset?.code || tx.operations[0].stateChanges[0].tokenId,
        date: tx.ledgerCreatedAt, // Assuming ledgerCreatedAt is in ISO format
      })
    }

    // Parse the response to match the expected schema
    const parsedResponse: ParseSchemaT = {
      address: walletHistory.account?.address ?? user.contractAddress,
      transactions: transactions,
    }
    return this.parseResponse(parsedResponse)
  }
}

export { endpoint }
