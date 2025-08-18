import { xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UserProductRepositoryType } from 'api/core/entities/user-product/types'
import { Vendor, VendorRepositoryType } from 'api/core/entities/vendor/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { getWalletBalance } from 'api/core/helpers/get-balance'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import AssetRepository from 'api/core/services/asset'
import ProductRepository from 'api/core/services/product'
import UserRepository from 'api/core/services/user'
import UserProductRepository from 'api/core/services/user-product'
import VendorRepository from 'api/core/services/vendor'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
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
  private productRepository: ProductRepositoryType
  private userProductRepository: UserProductRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService

  constructor(
    assetRepository?: AssetRepositoryType,
    userRepository?: UserRepositoryType,
    vendorRepository?: VendorRepositoryType,
    productRepository?: ProductRepositoryType,
    userProductRepository?: UserProductRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService
  ) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
    this.productRepository = productRepository || ProductRepository.getInstance()
    this.userProductRepository = userProductRepository || UserProductRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      ...request.query,
      email: request.userData?.email,
      amount: Number(request.query.amount),
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
    const asset = await this.assetRepository.getAssetByCode(validatedData.asset)

    if (!asset || !asset?.contractAddress) {
      // TODO: get asset data from network as fallback?
      throw new ResourceNotFoundException(messages.UNABLE_TO_FIND_ASSET_OR_CONTRACT)
    }

    const assetContractAddress = asset?.contractAddress

    // Check if user has available swags for this asset
    if (validatedData.type === 'swag') {
      const unclaimedSwags = await this.userProductRepository.getUserProductsByUserContractAddressAndAssetCode(
        user.contractAddress,
        asset.code,
        { where: { status: 'unclaimed' } }
      )

      if (!unclaimedSwags.length)
        throw new ResourceNotFoundException(messages.USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE)
    }

    // Get user balance from network
    const userBalance = await getWalletBalance({ userContractAddress: user.contractAddress, assetCode: asset.code })

    if (validatedData.type === 'transfer' && userBalance < validatedData.amount) {
      throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_ENOUGH_BALANCE)
    }

    if (validatedData.type === 'swag' && userBalance < validatedData.amount) {
      throw new ResourceNotFoundException(messages.USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE)
    }

    // Set transaction params
    let args: xdr.ScVal[] = []
    let method: string = 'transfer'

    if (validatedData.type === 'transfer' || validatedData.type === 'swag') {
      method = 'transfer'
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScVal(ScConvert.stringToPaddedString(validatedData.amount.toString())),
      ]
    } else if (validatedData.type === 'nft') {
      method = 'transfer'
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScValUnsigned(validatedData.id),
      ]
    }

    // Simulate contract
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: assetContractAddress,
      method,
      args,
    })

    // Generate challenge
    const challenge = await this.sorobanService.generateWebAuthnChallenge({
      contractId: assetContractAddress,
      simulationResponse: simulationResponse,
      signer: {
        addressId: user.contractAddress as string,
      },
    })

    // Generate options based on custom challenge (tx simulation)
    const options = await this.webauthnAuthenticationHelper.generateOptions({
      type: 'raw',
      user: user,
      customChallenge: challenge,
      customMetadata: {
        type: 'soroban',
        tx: tx,
        simulationResponse: simulationResponse,
      },
    })

    if (!options) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION)
    }

    // Get vendor data (for 'transfer' and 'nft' types only)
    let vendor: Vendor | null = null
    if (validatedData.type === 'transfer' || validatedData.type === 'nft') {
      vendor = await this.vendorRepository.getVendorByWalletAddress(validatedData.to)
    }

    // Get products data (for 'transfer' type only)
    let products: Product[] = []
    const productCodes =
      validatedData.type === 'transfer'
        ? validatedData.product
            ?.replace(/\s+/g, '')
            .split(',')
            .filter(product => product.length)
        : undefined
    if (productCodes?.length) {
      products = await this.productRepository.getProductsByCode(productCodes)
    }

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
        products: products.length
          ? products.map(product => ({
              product_id: product.productId,
              code: product.code,
              name: product.name,
              description: product.description,
            }))
          : undefined,
      },
      message: 'Retrieved transaction options successfully',
    }
  }
}

export { endpoint }
