import { nativeToScVal, xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { ProofRepositoryType } from 'api/core/entities/proof/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import ProofRepository from 'api/core/services/proof'
import UserRepository from 'api/core/services/user'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { STELLAR } from 'config/stellar'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/airdrop/options'

export class AirdropOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
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

    // Get airdrop contract address from config
    const airdropContractAddress = STELLAR.AIRDROP_CONTRACT_ADDRESS

    // Get user's Merkle proof from database
    const proof = await this.proofRepository.findByAddressAndContract(user.contractAddress, airdropContractAddress)

    if (!proof) {
      throw new ResourceNotFoundException(messages.AIRDROP_PROOF_NOT_FOUND)
    }

    // Check if claim has already been made
    const isClaimedResult = await this.sorobanService.simulateContractOperation({
      contractId: airdropContractAddress,
      method: 'is_claimed',
      args: [nativeToScVal(proof.index, { type: 'u32' })],
    })

    // If the claim simulation succeeds and returns true, the claim has already been made
    if (isClaimedResult.simulationResponse.result?.retval) {
      const isClaimedValue = isClaimedResult.simulationResponse.result.retval
      if (isClaimedValue.switch().name === 'scvBool' && isClaimedValue.b()) {
        throw new ResourceNotFoundException(messages.AIRDROP_ALREADY_CLAIMED)
      }
    }

    // Convert proof hex strings to ScVals
    const proofScVals = proof.proofs.map((proofHex: string) => {
      const proofBytes = Uint8Array.from(Buffer.from(proofHex, 'hex'))
      return nativeToScVal(proofBytes, { type: 'bytes' })
    })

    // Set claim transaction parameters
    const args: xdr.ScVal[] = [
      nativeToScVal(proof.index, { type: 'u32' }), // index
      nativeToScVal(user.contractAddress as string, { type: 'address' }), // receiver
      nativeToScVal(proof.receiverAmount, { type: 'i128' }), // amount
      nativeToScVal(proofScVals, { type: 'vec' }), // proof vector
    ]

    // Simulate claim contract operation
    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: airdropContractAddress,
      method: 'claim',
      args,
    })

    // Generate challenge
    const challenge = await this.sorobanService.generateWebAuthnChallenge({
      contractId: airdropContractAddress,
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

    return {
      data: {
        options_json: options,
        user: {
          email: user.email,
          address: user.contractAddress,
        },
      },
      message: 'Retrieved airdrop claim options successfully',
    }
  }
}

export { endpoint }
