import { xdr, rpc, Keypair } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { Nft as NftModel } from 'api/core/entities/nft/model'
import { Nft } from 'api/core/entities/nft/types'
import { NftSupply as NftSupplyModel } from 'api/core/entities/nft-supply/model'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import NftRepository from 'api/core/services/nft'
import NftSupplyRepository from 'api/core/services/nft-supply'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { AppDataSource } from 'config/database'
import { getValueFromEnv } from 'config/env-utils'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft/claim/complete'

export class ClaimNft extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepository
  private nftSupplyRepository: NftSupplyRepository
  private userRepository: UserRepositoryType
  private sorobanService: ISorobanService
  private walletBackend: WalletBackendType
  private transactionSigner: Keypair

  constructor(
    userRepository?: UserRepositoryType,
    nftRepository?: NftRepository,
    nftSupplyRepository?: NftSupplyRepository,
    sorobanService?: ISorobanService,
    walletBackend?: WalletBackendType,
    transactionSigner?: Keypair
  ) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
    this.transactionSigner =
      transactionSigner || Keypair.fromSecret(getValueFromEnv('NFT_CONTRACT_DEPLOYER_PRIVATE_KEY'))
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      ...request.body,
      email: request.userData?.email,
    } as RequestSchemaT

    if (!payload.email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)

    // Get user data
    const { email } = validatedData

    const user = await this.userRepository.getUserByEmail(email, { relations: ['passkeys'] })
    if (!user) {
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_EMAIL)
    }

    if (!user.contractAddress) {
      throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_WALLET)
    }

    if (!user.passkeys.length) {
      throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_PASSKEYS)
    }

    // Get NFT Supply data
    let nftSupply = await this.nftSupplyRepository.getNftSupplyByResourceAndSessionId(
      validatedData.resource,
      validatedData.session_id
    )
    if (!nftSupply) {
      nftSupply = await this.nftSupplyRepository.getNftSupplyByContractAndSessionId(
        validatedData.resource,
        validatedData.session_id
      )
    }

    if (!nftSupply) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
    }

    if (nftSupply.totalSupply - nftSupply.mintedAmount <= 0) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_ENOUGH)
    }

    // Validate if user already own a NFT to that session
    const userNft = await this.nftRepository.getNftByUserIdSessionId(user.userId, nftSupply.sessionId)

    if (userNft) {
      throw new ResourceNotFoundException(messages.NFT_ALREADY_OWNED_BY_USER)
    }

    // Prepare tx signer
    const transactionSigner: ContractSigner = {
      addressId: this.transactionSigner.publicKey(),
      methodOptions: {
        method: 'keypair',
        options: {
          secret: this.transactionSigner.secret(),
        },
      },
    }

    // Simulate 'mint' transaction
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: nftSupply.contractAddress,
      method: 'mint',
      args: [ScConvert.accountIdToScVal(user.contractAddress as string)],
      signers: [transactionSigner],
    })

    if (!tx || !simulationResponse) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    }

    // Execute all critical operations within a database transaction for "all or nothing" behavior
    const queryRunner = AppDataSource.createQueryRunner()
    let txResponse: rpc.Api.GetSuccessfulTransactionResponse
    let mintedTokenId: string
    let newUserNft: Nft

    try {
      // Start db transaction
      await queryRunner.connect()
      await queryRunner.startTransaction()

      // Lock the row for update to avoid race conditions
      const foundNftSupply = await queryRunner.manager
        .createQueryBuilder(NftSupplyModel, 'nftSupply')
        .setLock('pessimistic_write')
        .where('nftSupply.resource = :resource', { resource: validatedData.resource })
        .andWhere('nftSupply.sessionId = :sessionId', { sessionId: validatedData.session_id })
        .getOne()

      if (!foundNftSupply) {
        throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
      }

      if (foundNftSupply.totalSupply - foundNftSupply.mintedAmount <= 0) {
        throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_ENOUGH)
      }

      // Update user NFT data for the new minted token
      newUserNft = queryRunner.manager.create(NftModel, {
        sessionId: nftSupply.sessionId,
        contractAddress: nftSupply.contractAddress,
        nftSupply: foundNftSupply,
        user,
      })
      await queryRunner.manager.save(newUserNft)
      if (!newUserNft) {
        throw new BadRequestException(messages.UNABLE_TO_SAVE_NFT_TO_USER)
      }

      // Atomic increment of mintedAmount
      const updatedNftSupply = await queryRunner.manager.increment(
        NftSupplyModel,
        { nftSupplyId: nftSupply.nftSupplyId },
        'mintedAmount',
        1
      )

      // Update NFT supply
      if (!updatedNftSupply) {
        throw new BadRequestException(messages.UNABLE_TO_UPDATE_NFT_SUPPLY)
      }

      // Submit transaction at the end only if everything`s ok with prior database operations
      txResponse = await submitTx({
        tx,
        simulationResponse,
        walletBackend: this.walletBackend,
        sorobanService: this.sorobanService,
      })

      if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        throw new ResourceNotFoundException(`${messages.UNABLE_TO_MINT_NFT} ${messages.UNABLE_TO_EXECUTE_TRANSACTION}`)
      }

      // Get tokenId from tx response
      mintedTokenId = ScConvert.scValToString(txResponse.returnValue as xdr.ScVal)

      // Update newUserNft with newly minted tokenId
      await queryRunner.manager.update(NftModel, { nftId: newUserNft.nftId }, { tokenId: mintedTokenId })

      // Commit transaction if all operations succeed
      await queryRunner.commitTransaction()
    } catch (error) {
      // Rollback transaction on any failure
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // Release query runner
      await queryRunner.release()
    }

    return {
      data: {
        hash: txResponse.txHash,
        tokenId: mintedTokenId,
      },
      message: 'NFT claimed successfully',
    }
  }
}

export { endpoint }
