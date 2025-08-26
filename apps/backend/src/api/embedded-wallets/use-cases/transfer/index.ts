import { rpc } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { Nft } from 'api/core/entities/nft/model'
import { NftRepositoryType } from 'api/core/entities/nft/types'
import { NftSupply } from 'api/core/entities/nft-supply/model'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UserProductRepositoryType } from 'api/core/entities/user-product/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import AssetRepository from 'api/core/services/asset'
import NftRepository from 'api/core/services/nft'
import UserRepository from 'api/core/services/user'
import UserProductRepository from 'api/core/services/user-product'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { TransferTypes } from 'api/embedded-wallets/use-cases/transfer-options/types'
import { getValueFromEnv } from 'config/env-utils'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/transfer/complete'

export class Transfer extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepository
  private userRepository: UserRepositoryType
  private userProductRepository: UserProductRepositoryType
  private nftRepository: NftRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService
  private multicallContract: string

  constructor(
    userRepository?: UserRepositoryType,
    assetRepository?: AssetRepository,
    userProductRepository?: UserProductRepositoryType,
    nftRepository?: NftRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService,
    multicallContract?: string
  ) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.userProductRepository = userProductRepository || UserProductRepository.getInstance()
    this.nftRepository = nftRepository || NftRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
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

    // Get asset contract address from db
    const assetCodes = validatedData.asset
      ?.replace(/\s+/g, '')
      .split(',')
      .filter(code => code.length)
    const assets = await this.assetRepository.getAssetsByCode(assetCodes)

    if (!assets.length || !assets[0]?.contractAddress) {
      // TODO: get asset data from network as fallback?
      throw new ResourceNotFoundException(messages.UNABLE_TO_FIND_ASSET_OR_CONTRACT)
    }

    // Validate if NFT belongs to user
    let userNft: Nft | null = null
    if (validatedData.type == TransferTypes.NFT) {
      for (const asset of assets) {
        userNft = await this.nftRepository.getNftByTokenIdAndContractAddress(validatedData.id, asset.contractAddress)
        if (!userNft) {
          throw new ResourceNotFoundException(messages.NFT_NOT_FOUND_FOR_THE_USER)
        }
      }
    }

    // Verify auth/challenge
    const verifyAuth = await this.webauthnAuthenticationHelper.complete({
      type: 'raw',
      user,
      authenticationResponseJSON: validatedData.authentication_response_json,
    })

    if (!verifyAuth) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION)
    }

    const { customMetadata } = verifyAuth

    if (!customMetadata || customMetadata.type !== 'soroban') {
      throw new BadRequestException(messages.UNABLE_TO_FIND_SOROBAN_CUSTOM_METADATA)
    }

    // Build contract signer
    const passkeySigner: ContractSigner = {
      addressId: user.contractAddress as string,
      methodOptions: {
        method: 'webauthn',
        options: {
          clientDataJSON: verifyAuth.clientDataJSON,
          authenticatorData: verifyAuth.authenticatorData,
          signature: verifyAuth.compactSignature,
        },
      },
    }

    const contractId = assetCodes.length > 1 ? this.multicallContract : assets[0]?.contractAddress

    // Sign auth entries
    const tx = await this.sorobanService.signAuthEntries({
      contractId: contractId,
      tx: customMetadata.tx,
      simulationResponse: customMetadata.simulationResponse,
      signers: [passkeySigner],
    })

    // Simulate transfer
    const simulationResponse = await this.sorobanService.simulateTransaction(tx)

    // Broadcast transfer
    const txResponse = await submitTx({ tx, simulationResponse })

    if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_TRANSACTION)
    }

    if (validatedData.type === TransferTypes.SWAG) {
      for (const asset of assets) {
        const unclaimedSwags = await this.userProductRepository.getUserProductsByUserContractAddressAndAssetCode(
          user.contractAddress,
          asset.code,
          { where: { status: 'unclaimed' } }
        )

        if (!unclaimedSwags.length) throw new BadRequestException(messages.USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE)

        const swagToClaim = unclaimedSwags[0]

        swagToClaim.status = 'claimed'
        swagToClaim.claimedAt = new Date()
        await this.userProductRepository.saveUserProducts([swagToClaim])
      }
    } else if (validatedData.type === TransferTypes.NFT) {
      // Update nft data in db:
      // delete from current user and update to new user if it's an app user (get user by account/contract address)

      // If destination address is from an app user
      const newUser = await this.userRepository.getUserByContractAddress(validatedData.to)
      if (newUser) {
        const newUserNft = await this.nftRepository.createNft(
          {
            tokenId: userNft?.tokenId as string,
            contractAddress: userNft?.contractAddress as string,
            nftSupply: userNft?.nftSupply as NftSupply,
            user: newUser,
          },
          true
        )

        if (!newUserNft) {
          throw new BadRequestException(messages.UNABLE_TO_SAVE_NFT_TO_USER)
        }
      }

      // Delete NFT from previous user (who's transfering)
      const deletedUserNft = await this.nftRepository.deleteNft(userNft?.nftId as string)

      if (!deletedUserNft) {
        throw new BadRequestException(messages.UNABLE_TO_DELETE_USER_NFT)
      }
    }

    return {
      data: {
        hash: txResponse.txHash,
      },
      message: 'Transaction executed successfully',
    }
  }
}

export { endpoint }
