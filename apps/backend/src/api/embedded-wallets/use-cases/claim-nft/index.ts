import { xdr, rpc, Keypair } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import NftRepository from 'api/core/services/nft'
import NftSupplyRepository from 'api/core/services/nft-supply'
import UserRepository from 'api/core/services/user'
import { deterministicRandom } from 'api/core/utils/crypto'
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
import { WebAuthnChallengeService } from 'interfaces/webauthn-challenge'
import { IWebauthnChallengeService } from 'interfaces/webauthn-challenge/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/nft/claim/complete'

export class ClaimNft extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private nftRepository: NftRepository
  private nftSupplyRepository: NftSupplyRepository
  private userRepository: UserRepositoryType
  private sorobanService: ISorobanService
  private walletBackend: WalletBackendType
  private transactionSigner: Keypair
  private webauthnChallengeService: IWebauthnChallengeService

  constructor(
    userRepository?: UserRepositoryType,
    nftRepository?: NftRepository,
    nftSupplyRepository?: NftSupplyRepository,
    sorobanService?: ISorobanService,
    walletBackend?: WalletBackendType,
    transactionSigner?: Keypair,
    webauthnChallengeService?: IWebauthnChallengeService
  ) {
    super()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.nftSupplyRepository = nftSupplyRepository || NftSupplyRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
    this.transactionSigner =
      transactionSigner || Keypair.fromSecret(getValueFromEnv('NFT_CONTRACT_DEPLOYER_PRIVATE_KEY'))
    this.webauthnChallengeService = webauthnChallengeService || WebAuthnChallengeService.getInstance()
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
    const userNft = await this.nftRepository.getNftByUserAndSessionId(user.userId, nftSupply.sessionId, {
      includeDeleted: true,
    })

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

    // DONT CHANGE THE ORDER OF THE METADATA MAP ENTRIES
    // The smart contract relies on this order to parse the metadata correctly
    const metadataMap = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('resource'),
        val: xdr.ScVal.scvString(nftSupply.resource),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('session_id'),
        val: xdr.ScVal.scvString(nftSupply.sessionId),
      }),
    ])

    const tokenId = deterministicRandom(email, user.contractAddress, nftSupply.sessionId)

    // Simulate 'mint' transaction
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: nftSupply.contractAddress,
      method: 'mint_with_data',
      args: [ScConvert.accountIdToScVal(user.contractAddress as string), xdr.ScVal.scvU32(tokenId), metadataMap],
      signers: [transactionSigner],
    })

    if (!tx || !simulationResponse) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    }

    const attemptChallengeIdentifier = `${user.userId}-${validatedData.session_id}`

    if (this.webauthnChallengeService.getChallenge(attemptChallengeIdentifier)) {
      throw new ResourceNotFoundException(messages.NFT_ALREADY_OWNED_BY_USER)
    }

    const challenge = this.webauthnChallengeService.createChallenge(attemptChallengeIdentifier)
    // Store challenge for 30 seconds
    this.webauthnChallengeService.storeChallenge(attemptChallengeIdentifier, challenge, 30)

    // Increment minted amount before submitting transaction
    await this.nftSupplyRepository.incrementMintedAmount(nftSupply.nftSupplyId)

    try {
      // Submit transaction at the end only if everything`s ok with prior database operations
      const txResponse = await submitTx({
        tx,
        simulationResponse,
        walletBackend: this.walletBackend,
        sorobanService: this.sorobanService,
      })

      if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
        throw new ResourceNotFoundException(`${messages.UNABLE_TO_MINT_NFT} ${messages.UNABLE_TO_EXECUTE_TRANSACTION}`)
      }

      // Get tokenId from tx response
      const mintedTokenId = ScConvert.scValToString(txResponse.returnValue as xdr.ScVal)

      // Create NFT
      await this.nftRepository.createNft(
        {
          tokenId: mintedTokenId,
          transactionHash: txResponse.txHash,
          contractAddress: nftSupply.contractAddress,
          nftSupply,
          user,
        },
        true
      )

      return {
        data: {
          hash: txResponse.txHash,
          tokenId: mintedTokenId,
        },
        message: 'NFT claimed successfully',
      }
    } catch (error) {
      await this.nftSupplyRepository.decrementMintedAmount(nftSupply.nftSupplyId)
      throw error
    }
  }
}

export { endpoint }
