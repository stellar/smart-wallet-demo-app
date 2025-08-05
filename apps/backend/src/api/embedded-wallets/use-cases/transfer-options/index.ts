import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { getWalletBalance } from 'api/core/helpers/get-balance'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import AssetRepository from 'api/core/services/asset'
import UserRepository from 'api/core/services/user'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/transfer/options'

export class TransferOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepositoryType
  private userRepository: UserRepositoryType
  private vendorRepository: VendorRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService

  constructor(
    assetRepository?: AssetRepositoryType,
    userRepository?: UserRepositoryType,
    vendorRepository?: VendorRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService
  ) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = request.query as RequestSchemaT
    payload.email = request.userData?.email as string

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
    const asset = await this.assetRepository.getAssetByCode(validatedData.asset)
    const assetContractAddress = asset?.contractAddress ?? STELLAR.TOKEN_CONTRACT.NATIVE

    let args: xdr.ScVal[] = []

    if (validatedData.type === 'transfer') {
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScVal(ScConvert.stringToPaddedString(validatedData.amount)),
      ]
    } else if (validatedData.type === 'nft') {
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScValUnsigned(validatedData.id),
      ]
    }

    // Generate challenge
    const challenge = await this.sorobanService.generateWebAuthnChallengeFromContract({
      contractId: assetContractAddress,
      method: 'transfer',
      args,
      signer: {
        addressId: user.contractAddress as string,
      },
    })

    // Generate options based on custom challenge (tx simulation)
    const options = await this.webauthnAuthenticationHelper.generateOptions({
      user: user,
      customChallenge: challenge,
    })

    if (!options) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION)
    }

    // Get vendor data
    const vendor = await this.vendorRepository.getVendorByWalletAddress(validatedData.to)

    // Get user balance
    const userBalance = await getWalletBalance({
      userContractAddress: user.contractAddress,
      assetCode: validatedData.asset,
    })

    return {
      data: {
        options_json: options,
        user: {
          email: user.email,
          address: user.contractAddress,
          balance: userBalance,
        },
        vendor: vendor
          ? {
              name: vendor.name,
              wallet_address: vendor.walletAddress,
              profile_image: vendor.profileImage,
            }
          : undefined,
      },
      message: 'Retrieved transaction options successfully',
    }
  }
}

export { endpoint }
