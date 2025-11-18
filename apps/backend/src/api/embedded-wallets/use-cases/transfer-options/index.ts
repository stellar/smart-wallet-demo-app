import { xdr, nativeToScVal, StrKey } from '@stellar/stellar-sdk'
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
import { getValueFromEnv } from 'config/env-utils'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT, TransferTypes } from './types'

const endpoint = '/transfer/options'

export class TransferOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepositoryType
  private userRepository: UserRepositoryType
  private vendorRepository: VendorRepositoryType
  private productRepository: ProductRepositoryType
  private userProductRepository: UserProductRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService
  private multicallContract: string

  constructor(
    assetRepository?: AssetRepositoryType,
    userRepository?: UserRepositoryType,
    vendorRepository?: VendorRepositoryType,
    productRepository?: ProductRepositoryType,
    userProductRepository?: UserProductRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService,
    multicallContract?: string
  ) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.vendorRepository = vendorRepository || VendorRepository.getInstance()
    this.productRepository = productRepository || ProductRepository.getInstance()
    this.userProductRepository = userProductRepository || UserProductRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.multicallContract = multicallContract || getValueFromEnv('STELLAR_MULTICALL_CONTRACT')
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

    // Validate if 'to' address is non-existent (exclusive for not contract wallets)
    if (validatedData.type !== TransferTypes.NFT && !StrKey.isValidContract(validatedData.to) && validatedData.to) {
      const validAddress = await fetch(`${getValueFromEnv('STELLAR_HORIZON_URL')}/accounts/${validatedData.to}`)

      if (validAddress.status !== 200) {
        throw new ResourceNotFoundException(messages.INVALID_DESTINATION_ADDRESS)
      }
    }

    const destinationUser = await this.userRepository.getUserByContractAddress(validatedData.to)
    if (destinationUser) {
      throw new UnauthorizedException(messages.CANNOT_TRANSFER_P2P)
    }

    // Get asset contract address from db
    const assetCodes = validatedData.asset
      ?.replace(/\s+/g, '')
      .split(',')
      .filter(code => code.length)
    let assets = await this.assetRepository.getAssetsByCode(assetCodes)

    if (!assets.length || !assets[0]?.contractAddress) {
      assets = await this.assetRepository.getAssetsByContractAddress(assetCodes)
    }

    if (!assets.length || !assets[0]?.contractAddress) {
      // TODO: get asset data from network as fallback?
      throw new ResourceNotFoundException(messages.UNABLE_TO_FIND_ASSET_OR_CONTRACT)
    }

    // Check if user has available swags for this asset
    if (validatedData.type === TransferTypes.SWAG) {
      for (const asset of assets) {
        const unclaimedSwags = await this.userProductRepository.getUserProductsByUserContractAddressAndAssetCode(
          user.contractAddress,
          asset.code,
          { where: { status: 'unclaimed' } }
        )

        if (!unclaimedSwags.length) throw new BadRequestException(messages.USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE)
      }
    }

    const userBalances: { amount: number; asset: string }[] = []

    // Check if user has enough balance
    for (const asset of assets) {
      const balance = await getWalletBalance({
        userContractAddress: user.contractAddress,
        assetCode: asset.code,
        isToken: asset?.type !== 'native',
      })

      if (validatedData.type === TransferTypes.TRANSFER && balance < validatedData.amount) {
        throw new ResourceNotFoundException(messages.USER_DOES_NOT_HAVE_ENOUGH_BALANCE)
      }

      if (validatedData.type === TransferTypes.SWAG && balance < validatedData.amount) {
        throw new ResourceNotFoundException(messages.USER_SWAG_ALREADY_CLAIMED_OR_NOT_AVAILABLE)
      }

      userBalances.push({ amount: balance, asset: asset.code })
    }

    // Set transaction params
    let args: xdr.ScVal[] = []
    let method: string = 'transfer'

    if (validatedData.type === TransferTypes.TRANSFER || validatedData.type === TransferTypes.SWAG) {
      if (validatedData.type === TransferTypes.SWAG && assetCodes.length > 1) {
        method = 'exec'
        args = [
          ScConvert.accountIdToScVal(user.contractAddress as string), // caller
          ScConvert.arrayToScVal(
            assets.map(asset => [
              ScConvert.accountIdToScVal(asset.contractAddress),
              ScConvert.symbolToScVal('transfer'),
              [
                ScConvert.accountIdToScVal(user.contractAddress as string),
                ScConvert.accountIdToScVal(validatedData.to as string),
                ScConvert.stringToScVal(ScConvert.stringToPaddedString(validatedData.amount.toString())),
              ],
            ])
          ),
        ]
      } else {
        method = 'transfer'
        args = [
          ScConvert.accountIdToScVal(user.contractAddress as string),
          ScConvert.accountIdToScVal(validatedData.to as string),
          ScConvert.stringToScVal(ScConvert.stringToPaddedString(validatedData.amount.toString())),
        ]
      }
    } else if (validatedData.type === TransferTypes.NFT) {
      const ids = validatedData.id
        ?.replace(/\s+/g, '')
        .split(',')
        .filter(id => id.length)

      if (ids.length !== assetCodes.length) {
        throw new BadRequestException(messages.INVALID_INFORMATION)
      }

      if (ids.length > 1) {
        method = 'exec'
        args = [
          ScConvert.accountIdToScVal(user.contractAddress as string), // caller
          ScConvert.arrayToScVal(
            ids.map((id, index) => [
              ScConvert.accountIdToScVal(assetCodes[index]), // NFT contract
              ScConvert.symbolToScVal('transfer'),
              [
                ScConvert.accountIdToScVal(user.contractAddress as string),
                ScConvert.accountIdToScVal(validatedData.to as string),
                nativeToScVal(id, { type: 'u32' }),
              ],
            ])
          ),
        ]
      } else {
        method = 'transfer'
        args = [
          ScConvert.accountIdToScVal(user.contractAddress as string),
          ScConvert.accountIdToScVal(validatedData.to as string),
          nativeToScVal(ids[0], { type: 'u32' }),
        ]
      }
    }

    const contractId = assetCodes.length > 1 ? this.multicallContract : assets[0]?.contractAddress

    // Simulate contract
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: contractId,
      method,
      args,
    })

    // Generate challenge
    const challenge = await this.sorobanService.generateWebAuthnChallenge({
      contractId: contractId,
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
    if (validatedData.type === TransferTypes.TRANSFER || validatedData.type === TransferTypes.NFT) {
      vendor = await this.vendorRepository.getVendorByWalletAddress(validatedData.to, { where: { isActive: true } })
    }

    // Get products data (for 'transfer' type only)
    let products: Product[] = []
    const productCodes =
      validatedData.type === TransferTypes.TRANSFER
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
          balances: userBalances,
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
