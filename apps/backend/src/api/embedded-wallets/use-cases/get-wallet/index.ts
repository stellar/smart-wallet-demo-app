import { Request, Response } from 'express'

import { AssetRepositoryType } from 'api/core/entities/asset/types'
import { Product, ProductRepositoryType } from 'api/core/entities/product/types'
import { ProofRepositoryType } from 'api/core/entities/proof/types'
import { User, UserRepositoryType } from 'api/core/entities/user/types'
import { UserProductStatus } from 'api/core/entities/user-product/model'
import { UserProduct, UserProductRepositoryType } from 'api/core/entities/user-product/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { getWalletBalance } from 'api/core/helpers/get-balance'
import AssetRepository from 'api/core/services/asset'
import ProductRepository from 'api/core/services/product'
import ProofRepository from 'api/core/services/proof'
import UserRepository from 'api/core/services/user'
import UserProductRepository from 'api/core/services/user-product'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { sleepInSeconds } from 'api/core/utils/sleep'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SDPEmbeddedWallets from 'interfaces/sdp-embedded-wallets'
import { SDPEmbeddedWalletsType, WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'
import WalletBackend from 'interfaces/wallet-backend'

import { ParseSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/'

export class GetWallet extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private userRepository: UserRepositoryType
  private assetRepository: AssetRepositoryType
  private proofRepository: ProofRepositoryType
  private productRepository: ProductRepositoryType
  private userProductRepository: UserProductRepositoryType
  private sdpEmbeddedWallets: SDPEmbeddedWalletsType
  private sorobanService: ISorobanService
  private walletBackend: WalletBackend

  constructor(
    userRepository?: UserRepositoryType,
    assetRepository?: AssetRepositoryType,
    proofRepository?: ProofRepositoryType,
    productRepository?: ProductRepositoryType,
    userProductRepository?: UserProductRepositoryType,
    sdpEmbeddedWallets?: SDPEmbeddedWalletsType,
    sorobanService?: ISorobanService,
    walletBackend?: WalletBackend
  ) {
    super()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.proofRepository = proofRepository || ProofRepository.getInstance()
    this.productRepository = productRepository || ProductRepository.getInstance()
    this.userProductRepository = userProductRepository || UserProductRepository.getInstance()
    this.sdpEmbeddedWallets = sdpEmbeddedWallets || SDPEmbeddedWallets.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.walletBackend = walletBackend || WalletBackend.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = { id: request.userData?.userId } as RequestSchemaT
    if (!payload.id) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

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
      throw new ResourceNotFoundException(messages.USER_NOT_FOUND_BY_ID)
    }

    // Check if user already has a wallet
    if (user.contractAddress) {
      // Get all info from a valid wallet (balance, etc)
      const { balance, isAirdropAvailable, swags } = await this.infoFromValidWallet(user.userId, user.contractAddress)

      return this.parseResponse({
        status: WalletStatus.SUCCESS,
        address: user.contractAddress,
        email: user.email,
        balance,
        is_airdrop_available: isAirdropAvailable,
        swags,
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

        // Register the account in the wallet backend
        await this.walletBackend.registerAccount({ address: updatedStatus.contract_address })
        break
      }
      // If the address is not yet available, wait for a while before checking again
      await sleepInSeconds(1)
    }

    if (!user.contractAddress)
      return this.parseResponse({
        status: walletStatus,
        address: 'unknown',
        balance: 0,
        email: user.email,
        is_airdrop_available: false,
      })

    // Get all info from a valid wallet (balance, etc)
    const { balance, isAirdropAvailable, swags } = await this.infoFromValidWallet(user.userId, user.contractAddress)

    return this.parseResponse({
      status: walletStatus,
      address: user.contractAddress,
      email: user.email,
      balance,
      is_airdrop_available: isAirdropAvailable,
      swags,
    })
  }

  private async infoFromValidWallet(
    userId: string,
    contractAddress: string
  ): Promise<{ balance: number; isAirdropAvailable: boolean; swags: ResponseSchemaT['data']['swags'] }> {
    // Get wallet balance
    const balance = await getWalletBalance({
      userContractAddress: contractAddress,
      assetRepository: this.assetRepository,
      sorobanService: this.sorobanService,
    })

    // Get airdrop contract address from config
    const airdropContractAddress = STELLAR.AIRDROP_CONTRACT_ADDRESS

    // Get user airdrop proof
    const airdropProof = await this.proofRepository.findByAddressAndContract(contractAddress, airdropContractAddress)

    // Map swags
    const swags = await this.syncWalletSwags(userId, contractAddress)

    return {
      balance,
      isAirdropAvailable: airdropProof ? !airdropProof.isClaimed : false,
      swags,
    }
  }

  private async syncWalletSwags(userId: string, contractAddress: string) {
    // Get all visible swags
    const visibleSwags = await this.productRepository.getSwagProducts({
      where: { isHidden: false },
      relations: ['asset'],
    })

    // If no visible swags, return
    if (!visibleSwags.length) return

    // Get existing user products (swags)
    const existingUserProducts = await this.userProductRepository.getUserProductsByUserContractAddress(contractAddress)
    const existingProductIds = new Set(existingUserProducts.map(up => up.product.productId))

    // Check for missing swags (visible swags that the user does not have reference yet)
    const missingSwags = visibleSwags.filter(swag => !existingProductIds.has(swag.productId))
    if (!missingSwags.length) return this.parseSwags(existingUserProducts)

    // Create new user products (swags) from missing swags
    const newUserProducts: UserProduct[] = []
    for (const swag of missingSwags) {
      const userProduct = await this.userProductRepository.createUserProduct({
        user: { userId } as User,
        product: { productId: swag.productId } as Product,
        status: 'unclaimed',
      })
      newUserProducts.push(userProduct)
    }

    // Save new user products (swags)
    await this.userProductRepository.saveUserProducts(newUserProducts)
    const userProducts = await this.userProductRepository.getUserProductsByUserContractAddress(contractAddress)

    return this.parseSwags(userProducts)
  }

  private parseSwags(userProducts: UserProduct[]): ResponseSchemaT['data']['swags'] {
    return userProducts.map(swag => ({
      code: swag.product.code,
      name: swag.product.name,
      description: swag.product.description,
      imageUrl: swag.product.imageUrl,
      assetCode: swag.product.asset.code,
      status: swag.status as UserProductStatus,
    }))
  }
}

export { endpoint }
