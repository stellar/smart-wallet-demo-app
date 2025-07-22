import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { sleepInSeconds } from 'api/core/utils/sleep'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import Soroban from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, SimulateContract } from 'interfaces/soroban/types'

import { ParseSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class GetWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType
  private sorobanService: ISorobanService

  constructor(
    userRepository?: UserRepositoryType,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType,
    sorobanService?: ISorobanService
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
    this.sorobanService = sorobanService || Soroban.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { id: request.userData?.userId } as RequestSchemaT
    if (!payload.id) {
      throw new UnauthorizedException('Not authorized')
    }
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  // parseResponse(status: WalletStatus, address?: string, email?: string, balance?: string): ResponseSchemaT {
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
      throw new ResourceNotFoundException(`User with id ${validatedData.id} not found`)
    }

    // Check if user already has a wallet
    if (user.contractAddress) {

      // Get wallet balance
      let walletBalance: string
      const { simulationResponse } = await this.sorobanService.simulateContract({
        contractId: STELLAR.TOKEN_CONTRACT.NATIVE, // TODO: get balance for another assets?
        method: 'balance',
        args: [ScConvert.accountIdToScVal(user.contractAddress as string)],
      } as SimulateContract)
      walletBalance = ScConvert.scValToFormatString(simulationResponse.result!.retval)

      return this.parseResponse({
        status: WalletStatus.SUCCESS,
        address: user.contractAddress,
        email: user.email,
        balance: walletBalance,
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
        break
      }
      // If the address is not yet available, wait for a while before checking again
      await sleepInSeconds(1)
    }
    
    return this.parseResponse({
      status: walletStatus,
      address: user.contractAddress,
      email: user.email,
    })
  }
}

export { endpoint }
