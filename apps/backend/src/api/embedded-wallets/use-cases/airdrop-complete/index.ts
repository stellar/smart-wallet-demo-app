import { rpc } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { ProofRepositoryType } from 'api/core/entities/proof/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import { submitTx } from 'api/core/helpers/submit-tx'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import ProofRepository from 'api/core/services/proof'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ISorobanService, ContractSigner } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/airdrop/complete'

export class AirdropComplete extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private proofRepository: ProofRepositoryType
  private userRepository: UserRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService

  constructor(
    proofRepository?: ProofRepositoryType,
    userRepository?: UserRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService
  ) {
    super()
    this.proofRepository = proofRepository || ProofRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
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

    // Get airdrop contract address from config
    const airdropContractAddress = STELLAR.AIRDROP_CONTRACT_ADDRESS

    // Verify user has a proof for this airdrop
    const proof = await this.proofRepository.findByAddressAndContract(user.contractAddress, airdropContractAddress)

    if (!proof) {
      throw new ResourceNotFoundException(messages.AIRDROP_PROOF_NOT_FOUND)
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

    // Sign auth entries
    const tx = await this.sorobanService.signAuthEntries({
      contractId: airdropContractAddress,
      tx: customMetadata.tx,
      simulationResponse: customMetadata.simulationResponse,
      signers: [passkeySigner],
    })

    // Simulate claim transaction
    const simulationResponse = await this.sorobanService.simulateTransaction(tx)

    // Broadcast claim transaction
    const txResponse = await submitTx({ tx, simulationResponse })

    if (!txResponse || txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new ResourceNotFoundException(messages.UNABLE_TO_EXECUTE_AIRDROP_CLAIM)
    }

    // Update database proof
    proof.isClaimed = true
    await this.proofRepository.saveProofs([proof])

    return {
      data: {
        hash: txResponse.txHash,
      },
      message: 'Airdrop claimed successfully',
    }
  }
}

export { endpoint }
