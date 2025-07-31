import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { sleepInSeconds } from 'api/core/utils/sleep'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, SimulateContract } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'

import { ParseSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class GetWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType
  private sorobanService: ISorobanService
  private walletBackend: WalletBackend

  constructor(
    userRepository?: UserRepositoryType,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType,
    sorobanService?: ISorobanService,
    walletBackend?: WalletBackend
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
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

  parseResponse(response: ParseSchemaT): ResponseSchemaT {
    return {
      data: {
        ...response,
      },
      message: 'Wallet details retrieved successfully',
    }
  }

  async handle(payload: RequestSchemaT) {
    const validatedData = this.validate(payload, RequestSchema)

    // Check if user exists (should not be necessary, but added for safety)
    let user = await this.userRepository.getUserById(validatedData.id)
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_ID)
    }

    // Check if user already has a wallet
    if (user.contractAddress) {
      // Get wallet balance
      const balance = await this.getWalletBalance(user.contractAddress)

      return this.parseResponse({
        status: WalletStatus.SUCCESS,
        address: user.contractAddress,
        email: user.email,
        balance,
      })
    }

    // Check updated wallet status
    // Wallet should already be created, but we will loop a few times to ensure we get the latest status
    let walletStatus = WalletStatus.PENDING
    for (let i = 0; i < 3; i++) {
      const updatedStatus = await this.sdpEmbeddedWallets.checkWalletStatus(user.uniqueToken)
      walletStatus = updatedStatus.status
      if (updatedStatus.contract_address) {
        // Update user with the new wallet address
        user = await this.userRepository.updateUser(user.userId, { contractAddress: updatedStatus.contract_address })

        // Register the account in the wallet backend
        await this.walletBackend.registerAccount({ address: updatedStatus.contract_address })
        break
      }
      // If the address is not yet available, wait for a while before checking again
      await sleepInSeconds(1)
    }

    if (!user.contractAddress) {
      throw new BadRequestException(messages.UNKNOWN_CONTRACT_ADDRESS_CREATION_ERROR)
    }

    // Get wallet balance
    const balance = await this.getWalletBalance(user.contractAddress)

    return this.parseResponse({
      status: walletStatus,
      address: user.contractAddress,
      email: user.email,
      balance,
    })
  }

  private async getWalletBalance(userContractAddress: string): Promise<number> {
    const { simulationResponse } = await this.sorobanService.simulateContract({
      contractId: STELLAR.TOKEN_CONTRACT.NATIVE, // TODO: get balance for another assets?
      method: 'balance',
      args: [ScConvert.accountIdToScVal(userContractAddress)],
    } as SimulateContract)

    const walletBalance: number = Number(ScConvert.scValToFormatString(simulationResponse.result?.retval as xdr.ScVal))
    return walletBalance
  }
}

export { endpoint }
