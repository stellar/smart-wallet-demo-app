import { xdr, rpc, Keypair } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { Nft as NftModel } from 'api/core/entities/nft/model'
import { Nft } from 'api/core/entities/nft/types'
import { NftSupply as NftSupplyModel } from 'api/core/entities/nft-supply/model'
import { NftSupply } from 'api/core/entities/nft-supply/types'
import { User, UserRepositoryType } from 'api/core/entities/user/types'
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
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { addMintRequest } from 'interfaces/batch-mint/mint-queue'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft/claim/complete'

type ValidatedPayload = RequestSchemaT & {
  user: User
  nftSupply: NftSupply
}

export class ClaimNft extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepository
  private nftSupplyRepository: NftSupplyRepository
  private userRepository: UserRepositoryType
  private sorobanService: ISorobanService
  private walletBackend: WalletBackendType
  private transactionSigner: Keypair
  private multicallContract: string

  constructor(
    userRepository?: UserRepositoryType,
    nftRepository?: NftRepository,
    nftSupplyRepository?: NftSupplyRepository,
    sorobanService?: ISorobanService,
    walletBackend?: WalletBackendType,
    transactionSigner?: Keypair,
    multicallContract?: string
  ) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
    this.transactionSigner =
      transactionSigner || Keypair.fromSecret(getValueFromEnv('NFT_CONTRACT_DEPLOYER_PRIVATE_KEY'))
    this.multicallContract = multicallContract || getValueFromEnv('STELLAR_MULTICALL_CONTRACT')
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      ...request.body,
      email: request.userData?.email,
    } as RequestSchemaT

    if (!payload.email) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const validatedData = await this.validatePayload(payload)
    const result = await addMintRequest(validatedData)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(validatedPayload: ValidatedPayload | ValidatedPayload[]): Promise<ResponseSchemaT | ResponseSchemaT[]> {
    const parsedPayload = Array.isArray(validatedPayload) ? validatedPayload : [validatedPayload]

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

    // Set transaction params
    let args: xdr.ScVal[] = []
    let method: string = 'mint_with_data'

    if (parsedPayload.length > 1) {
      method = 'exec'
      args = [
        ScConvert.accountIdToScVal(this.transactionSigner.publicKey()), // caller
        ScConvert.arrayToScVal(
          parsedPayload.map(payload => [
            ScConvert.accountIdToScVal(payload.nftSupply.contractAddress as string),
            ScConvert.symbolToScVal('mint_with_data'),
            [
              ScConvert.accountIdToScVal(payload.user.contractAddress as string),
              // metadata
              xdr.ScVal.scvMap([
                new xdr.ScMapEntry({
                  key: xdr.ScVal.scvSymbol('resource'),
                  val: xdr.ScVal.scvString(payload.nftSupply.resource),
                }),
                new xdr.ScMapEntry({
                  key: xdr.ScVal.scvSymbol('session_id'),
                  val: xdr.ScVal.scvString(payload.nftSupply.sessionId),
                }),
              ]),
            ],
          ])
        ),
      ]
    } else {
      method = 'mint_with_data'
      args = [
        ScConvert.accountIdToScVal(parsedPayload[0].user.contractAddress as string),
        // metadata
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('resource'),
            val: xdr.ScVal.scvString(parsedPayload[0].nftSupply.resource),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('session_id'),
            val: xdr.ScVal.scvString(parsedPayload[0].nftSupply.sessionId),
          }),
        ]),
      ]
    }

    const contractId = parsedPayload.length > 1 ? this.multicallContract : parsedPayload[0].nftSupply.contractAddress

    // Simulate mint transaction
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId,
      method,
      args,
      signers: [transactionSigner],
    })

    if (!tx || !simulationResponse) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    }

    // Execute all critical operations within a database transaction for "all or nothing" behavior
    const queryRunner = AppDataSource.createQueryRunner()
    let txResponse: rpc.Api.GetSuccessfulTransactionResponse
    let mintedTokenIds: string[] = []
    let newUserNft: Nft

    try {
      // Start db transaction
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const createdNfts: NftModel[] = []
      const suppliesToIncrement: NftSupplyModel[] = []

      for (const payload of parsedPayload) {
        const { user, resource, session_id: sessionId } = payload
        // Lock the row for update to avoid race conditions
        const foundNftSupply = await queryRunner.manager
          .createQueryBuilder(NftSupplyModel, 'nftSupply')
          .setLock('pessimistic_write')
          .where('nftSupply.resource = :resource', { resource: resource })
          .andWhere('nftSupply.sessionId = :sessionId', { sessionId: sessionId })
          .getOne()

        if (!foundNftSupply) {
          throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
        }

        if (foundNftSupply.totalSupply - foundNftSupply.mintedAmount <= 0) {
          throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_ENOUGH)
        }

        // Re-check if user already owns NFT for this session (prevents race conditions)
        const existingUserNft = await queryRunner.manager.findOne(NftModel, {
          where: { user: { userId: user.userId }, nftSupply: { sessionId: foundNftSupply.sessionId } },
        })
        if (existingUserNft) {
          throw new ResourceNotFoundException(messages.NFT_ALREADY_OWNED_BY_USER)
        }

        // Prepare new NFT entry
        newUserNft = queryRunner.manager.create(NftModel, {
          sessionId: foundNftSupply.sessionId,
          contractAddress: foundNftSupply.contractAddress,
          nftSupply: foundNftSupply,
          user,
        })

        createdNfts.push(newUserNft)
        suppliesToIncrement.push(foundNftSupply)
      }

      // Save new NFT entries
      await queryRunner.manager.save(createdNfts)

      // Update NFT supply
      for (const supply of suppliesToIncrement) {
        await queryRunner.manager.increment(NftSupplyModel, { nftSupplyId: supply.nftSupplyId }, 'mintedAmount', 1)
      }

      // Submit transaction at the end only if everything`s ok with prior database operations
      txResponse = await submitTx({
        tx,
        simulationResponse,
        walletBackend: this.walletBackend,
        sorobanService: this.sorobanService,
      })

      if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        throw new ResourceNotFoundException(messages.UNABLE_TO_MINT_NFT)
      }

      // Get tokenId(s) from tx response
      if (parsedPayload.length > 1) {
        // Multicall transaction - extract array of tokenIds
        const returnValues = txResponse.returnValue as xdr.ScVal
        if (returnValues.switch().value === xdr.ScValType.scvVec().value) {
          const vec = returnValues.vec()
          if (vec) {
            mintedTokenIds = vec.map(scVal => ScConvert.scValToString(scVal))
          }
        }
      } else {
        // Single mint transaction - extract single tokenId
        mintedTokenIds = [ScConvert.scValToString(txResponse.returnValue as xdr.ScVal)]
      }

      // Update each NFT with its corresponding tokenId
      for (let i = 0; i < createdNfts.length; i++) {
        await queryRunner.manager.update(
          NftModel,
          { nftId: createdNfts[i].nftId },
          {
            tokenId: mintedTokenIds[i],
            transactionHash: txResponse.txHash,
          }
        )
      }

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

    const result = {
      data: {
        hash: txResponse?.txHash || '',
      },
      message: 'NFT claimed successfully',
    }

    return Array.isArray(validatedPayload) ? Array(parsedPayload.length).fill(result) : result
  }

  private async validatePayload(payload: RequestSchemaT): Promise<ValidatedPayload> {
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
    const userNft = await this.nftRepository.getNftByUserAndSessionId(user.userId, nftSupply.sessionId, {
      includeDeleted: true,
    })

    if (userNft) {
      throw new ResourceNotFoundException(messages.NFT_ALREADY_OWNED_BY_USER)
    }

    return {
      ...validatedData,
      user,
      nftSupply,
    }
  }
}

export { endpoint }
