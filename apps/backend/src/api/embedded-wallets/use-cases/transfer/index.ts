import { xdr, rpc } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import AssetRepository from 'api/core/services/asset'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ScConvert } from 'interfaces/soroban/helpers/sc-convert'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/transfer/complete'

export class Transfer extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private assetRepository: AssetRepository
  private userRepository: UserRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService

  constructor(
    userRepository?: UserRepositoryType,
    assetRepository?: AssetRepository,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService
  ) {
    super()
    this.assetRepository = assetRepository || AssetRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>) {
    const payload = {
      email: request.userData?.email as string,
      type: request.body?.type as string,
      asset: request.body?.asset as string,
      to: request.body?.to as string,
      amount: request.body?.amount as string,
      id: request.body?.id as string, // NFT id
      authentication_response_json: request.body?.authenticationResponseJSON as string,
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

    // Verify auth/challenge
    const verifyAuth = await this.webauthnAuthenticationHelper.complete({
      user,
      authenticationResponseJSON: validatedData.authentication_response_json,
    })

    if (!verifyAuth) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_COMPLETE_PASSKEY_AUTHENTICATION)
    }

    // Build contract signer
    const passkeySigner: ContractSigner = {
      addressId: user.contractAddress as string,
      methodOptions: {
        method: 'webauthn',
        options: {
          credentialId: verifyAuth.passkey.credentialId,
          clientDataJSON: verifyAuth.clientDataJSON,
          authenticatorData: verifyAuth.authenticatorData,
          compactSignature: verifyAuth.compactSignature,
        },
      },
    }

    // Get asset contract address
    const asset = await this.assetRepository.getAssetByCode(validatedData.asset)
    const assetContractAddress = asset?.contractAddress ?? STELLAR.TOKEN_CONTRACT.NATIVE

    let args: xdr.ScVal[] = []
    let method: string = 'transfer'

    // Transfer fungible/fractional assets
    if (validatedData.type === 'transfer') {
      method = 'transfer'
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScVal(ScConvert.stringToPaddedString(validatedData.amount)),
      ]
    }
    // Transfer NFTs in conformity with SEP-50 specs: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0050.md
    else if (validatedData.type === 'nft') {
      method = 'transfer'
      args = [
        ScConvert.accountIdToScVal(user.contractAddress as string),
        ScConvert.accountIdToScVal(validatedData.to as string),
        ScConvert.stringToScValUnsigned(validatedData.id),
      ]
    }

    // Simulate transfer
    const { tx, simulationResponse } = await this.sorobanService.simulateContract({
      contractId: assetContractAddress,
      method,
      args,
      signers: [passkeySigner],
    })

    // Broadcast transfer
    const txResponse = await submitTx({ tx, simulationResponse })

    if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_TRANSACTION)
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
