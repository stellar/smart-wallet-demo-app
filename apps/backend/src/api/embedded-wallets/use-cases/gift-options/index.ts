import { nativeToScVal, xdr } from '@stellar/stellar-sdk'
import { Request, Response } from 'express'

import { GiftReservationRepositoryType } from 'api/core/entities/gift-claim/types'
import { ProofRepositoryType } from 'api/core/entities/proof/types'
import { UserRepositoryType } from 'api/core/entities/user/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import WebAuthnAuthentication from 'api/core/helpers/webauthn/authentication'
import { IWebAuthnAuthentication } from 'api/core/helpers/webauthn/authentication/types'
import GiftReservationRepository from 'api/core/services/gift-claim'
import ProofRepository from 'api/core/services/proof'
import UserRepository from 'api/core/services/user'
import { sha256Hash } from 'api/core/utils/crypto'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/embedded-wallets/constants/messages'
import { logger } from 'config/logger'
import { STELLAR } from 'config/stellar'
import { ResourceConflictedException } from 'errors/exceptions/resource-conflict'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'
import { GiftEligibilityService, IGiftEligibilityService } from 'interfaces/gift-eligibility-service'
import SorobanService from 'interfaces/soroban'
import { ISorobanService } from 'interfaces/soroban/types'

import { RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/gift/options'

export class GiftOptions extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private proofRepository: ProofRepositoryType
  private userRepository: UserRepositoryType
  private giftReservationRepository: GiftReservationRepositoryType
  private webauthnAuthenticationHelper: IWebAuthnAuthentication
  private sorobanService: ISorobanService
  private giftEligibilityService: IGiftEligibilityService

  constructor(
    proofRepository?: ProofRepositoryType,
    userRepository?: UserRepositoryType,
    giftReservationRepository?: GiftReservationRepositoryType,
    webauthnAuthenticationHelper?: IWebAuthnAuthentication,
    sorobanService?: ISorobanService,
    giftEligibilityService?: IGiftEligibilityService
  ) {
    super()
    this.proofRepository = proofRepository || ProofRepository.getInstance()
    this.userRepository = userRepository || UserRepository.getInstance()
    this.giftReservationRepository = giftReservationRepository || GiftReservationRepository.getInstance()
    this.webauthnAuthenticationHelper = webauthnAuthenticationHelper || WebAuthnAuthentication.getInstance()
    this.sorobanService = sorobanService || SorobanService.getInstance()
    this.giftEligibilityService = giftEligibilityService || new GiftEligibilityService()
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

    const { email, giftId } = validatedData

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

    const eligible = await this.giftEligibilityService.checkGiftEligibility(giftId)
    if (!eligible) {
      logger.warn({ requestId: this.requestId, giftId: sha256Hash(giftId) }, 'Gift ID is not eligible for claiming')
      throw new ResourceNotFoundException(messages.GIFT_NOT_ELIGIBLE)
    }

    const reservation = await this.giftReservationRepository.reserveGift(giftId, user.contractAddress)
    if (!reservation) {
      logger.warn(
        { requestId: this.requestId, giftId: sha256Hash(giftId), address: user.contractAddress },
        'Gift has already been reserved/claimed by another address'
      )
      throw new ResourceConflictedException(messages.GIFT_ALREADY_CLAIMED_BY_ANOTHER_ADDRESS)
    }

    const giftContractAddress = STELLAR.GIFT_AIRDROP_CONTRACT_ADDRESS

    const proof = await this.proofRepository.findByAddressAndContract(user.contractAddress, giftContractAddress)

    if (!proof) {
      throw new ResourceNotFoundException(messages.GIFT_PROOF_NOT_FOUND)
    }

    const isClaimedResult = await this.sorobanService.simulateContractOperation({
      contractId: giftContractAddress,
      method: 'is_claimed',
      args: [nativeToScVal(proof.index, { type: 'u32' })],
    })

    if (isClaimedResult.simulationResponse.result?.retval) {
      const isClaimedValue = isClaimedResult.simulationResponse.result.retval
      if (isClaimedValue.switch().name === 'scvBool' && isClaimedValue.b()) {
        logger.warn(
          {
            requestId: this.requestId,
            giftId: sha256Hash(giftId),
            address: user.contractAddress,
            contractAddress: giftContractAddress,
          },
          'Gift has already been claimed onchain'
        )

        throw new ResourceNotFoundException(messages.GIFT_ALREADY_CLAIMED)
      }
    }

    const proofScVals = proof.proofs.map((proofHex: string) => {
      const proofBytes = Uint8Array.from(Buffer.from(proofHex, 'hex'))
      return nativeToScVal(proofBytes, { type: 'bytes' })
    })

    const args: xdr.ScVal[] = [
      nativeToScVal(proof.index, { type: 'u32' }), // index
      nativeToScVal(user.contractAddress as string, { type: 'address' }), // receiver
      nativeToScVal(proof.receiverAmount, { type: 'i128' }), // amount
      nativeToScVal(proofScVals, { type: 'vec' }), // proof vector
    ]

    const { tx, simulationResponse } = await this.sorobanService.simulateContractOperation({
      contractId: giftContractAddress,
      method: 'claim',
      args,
    })

    const challenge = await this.sorobanService.generateWebAuthnChallenge({
      contractId: giftContractAddress,
      simulationResponse: simulationResponse,
      signer: {
        addressId: user.contractAddress as string,
      },
    })

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

    logger.info(
      {
        requestId: this.requestId,
        giftId: sha256Hash(giftId),
        address: user.contractAddress,
        contractAddress: giftContractAddress,
      },
      'Successfully generated gift claim options'
    )

    return {
      data: {
        options_json: options,
        user: {
          email: user.email,
          address: user.contractAddress,
        },
      },
      message: 'Retrieved gift claim options successfully',
    }
  }
}

export { endpoint }
