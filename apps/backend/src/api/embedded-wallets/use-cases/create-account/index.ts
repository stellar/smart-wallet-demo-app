import { rpc } from '@stellar/stellar-sdk'
import axios from 'axios'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/create-account'

export class CreateAccount extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private walletBackend: WalletBackendType
  private sorobanService: ISorobanService

  constructor(
    userRepository?: UserRepositoryType,
    walletBackend?: WalletBackendType,
    sorobanService?: ISorobanService
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    this.setRequestId(request)

    const email = request.userData?.email

    if (!email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const payload = {
      ...request.body,
      email,
    }

    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT & { email: string }): Promise<ResponseSchemaT> {
    if (!payload.email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const validatedData = this.validate(payload, RequestSchema)

    const user = await this.userRepository.getUserByEmail(payload.email)
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    // Validate if address is non-existent
    const validAddress = await fetch(`${getValueFromEnv('STELLAR_HORIZON_URL')}/accounts/${validatedData.address}`)
    if (validAddress.status === 200)
      return {
        data: {
          address: validatedData.address,
        },
        message: 'Account already exists',
      }

    if (user.createdAccountAddress) {
      throw new ResourceConflictedException(messages.USER_ALREADY_CREATED_ACCOUNT)
    }

    let walletResponse
    try {
      walletResponse = await this.walletBackend.createSponsoredAccount(validatedData.address)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HttpStatusCodes.CONFLICT) {
        throw new ResourceConflictedException(messages.ACCOUNT_ALREADY_EXISTS_ON_NETWORK)
      }
      throw error
    }

    // Wrap the transaction in a fee bump transaction
    const feeBumpResponse = await this.walletBackend.createFeeBumpTransaction({
      transaction: walletResponse.transaction,
    })

    const txResponse = await this.sorobanService.sendTransaction(feeBumpResponse.transaction)

    if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      logger.error(
        {
          requestId: this.requestId,
          userId: user.userId,
          status: txResponse?.status,
        },
        'Account creation transaction failed'
      )
      throw new ResourceNotFoundException(messages.UNABLE_TO_SUBMIT_ACCOUNT_CREATION_TRANSACTION)
    }

    user.createdAccountAddress = validatedData.address
    await this.userRepository.saveUser(user)

    logger.info(
      {
        requestId: this.requestId,
        userId: user.userId,
      },
      'Account created successfully'
    )

    return {
      data: {
        address: validatedData.address,
        transaction: feeBumpResponse.transaction,
        networkPassphrase: feeBumpResponse.networkPassphrase,
      },
      message: 'Account created successfully',
    }
  }
}

export { endpoint }
