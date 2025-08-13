import { xdr, Keypair } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import NftRepository from 'api/core/services/nft'
import NftSupplyRepository from 'api/core/services/nft-supply'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { getValueFromEnv } from 'config/env-utils'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'
import { WalletBackendType } from 'interfaces/wallet-backend/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft/claim/complete'

export class ClaimNftOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
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
      transactionSigner || Keypair.fromSecret(getValueFromEnv('STELLAR_SOURCE_ACCOUNT_PRIVATE_KEY'))
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      ...request.query,
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
    let nftSupply = await this.nftSupplyRepository.getNftSupplyByResource(validatedData.resource)
    if (!nftSupply) {
      nftSupply = await this.nftSupplyRepository.getNftSupplyByContractAddress(validatedData.resource)
    }

    if (!nftSupply) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_FOUND)
    }

    if (nftSupply.totaSupply - nftSupply.currentSupply <= 0) {
      throw new ResourceNotFoundException(messages.NFT_SUPPLY_NOT_ENOUGH)
    }

    // Validate if user already own a NFT to that session
    const userNft = await this.nftRepository.getNftBySessionId(nftSupply.sessionId)

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

    // Get total supply of already minted tokens
    const { simulationResponse: simulationSupplyResponse } = await this.sorobanService.simulateContractOperation({
      contractId: nftSupply.contractAddress,
      method: 'total_supply',
      args: [],
    })
    const totaSupply: number = Number(
      ScConvert.scValToFormatString(simulationSupplyResponse.result?.retval as xdr.ScVal)
    )
    const lastMintedIndex = totaSupply - 1 // zero-based index

    // Get tokenID of the last minted token in the contract
    const { simulationResponse: simulationTokenIdResponse } = await this.sorobanService.simulateContractOperation({
      contractId: nftSupply.contractAddress,
      method: 'get_token_id',
      args: [ScConvert.numberToScVal(lastMintedIndex)],
    })

    // Infer next tokenID from total supply and last minted tokenID
    const lastMintedTokenId: number = Number(
      ScConvert.scValToFormatString(simulationTokenIdResponse.result?.retval as xdr.ScVal)
    )
    const nextTokenId = lastMintedTokenId + 1 // Next tokenID to mint (when convention fro tokenID is a sequential number)

    // Simulate 'mint' transaction
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: nftSupply.contractAddress,
      method: 'mint',
      args: [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.stringToScValUnsigned(nextTokenId.toString()),
      ],
      signers: [transactionSigner],
    })

    // Submit transaction
    await submitTx({
      tx,
      simulationResponse,
      walletBackend: this.walletBackend,
      sorobanService: this.sorobanService,
    })

    return {
      data: {
        hash: '',
      },
      message: 'NFT claimed successfully',
    }
  }
}

export { endpoint }
