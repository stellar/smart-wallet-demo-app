import { Request, Response } from 'express'

import { ProofRepositoryType } from 'api/core/entities/proof/types'
import { UseCaseBase } from 'api/core/framework/use-case/base'
import { IUseCaseHttp } from 'api/core/framework/use-case/http'
import ProofRepository from 'api/core/services/proof'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { messages } from 'api/proofs/constants/messages'
import { logger } from 'config/logger'
import { STELLAR } from 'config/stellar'
import { BadRequestException } from 'errors/exceptions/bad-request'
import { ResourceNotFoundException } from 'errors/exceptions/resource-not-found'
import { UnauthorizedException } from 'errors/exceptions/unauthorized'

import { ParseSchemaT, RequestSchema, RequestSchemaT, ResponseSchemaT } from './types'

const endpoint = '/:address'

export class GetProofByAddress extends UseCaseBase implements IUseCaseHttp<ResponseSchemaT> {
  private proofRepository: ProofRepositoryType

  constructor(proofRepository?: ProofRepositoryType) {
    super()
    this.proofRepository = proofRepository || ProofRepository.getInstance()
  }

  async executeHttp(request: Request, response: Response<ResponseSchemaT>): Promise<Response<ResponseSchemaT>> {
    if (!request.userData?.userId) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED)
    }

    const payload = request.params as RequestSchemaT
    const result = await this.handle(payload)
    return response.status(HttpStatusCodes.OK).json(result)
  }

  async handle(payload: RequestSchemaT): Promise<ResponseSchemaT> {
    const validatedData = this.validate(payload, RequestSchema)
    const { address } = validatedData
    const contractAddress = STELLAR.AIRDROP_CONTRACT_ADDRESS

    logger.info({ requestId: this.requestId, address, contractAddress }, 'Fetching proof for address and contract')

    const proof = await this.proofRepository.findByAddressAndContract(address, contractAddress)

    if (!proof) {
      logger.warn({ requestId: this.requestId, address, contractAddress }, 'Proof not found for address and contract')
      throw new ResourceNotFoundException(messages.PROOF_NOT_FOUND)
    }

    const amount = Number(proof.receiverAmount)
    if (!Number.isFinite(amount) || amount < 0) {
      logger.error(
        { requestId: this.requestId, receiverAmount: proof.receiverAmount },
        'Invalid receiver amount in database'
      )
      throw new BadRequestException(messages.INVALID_RECEIVER_AMOUNT)
    }

    logger.info(
      {
        requestId: this.requestId,
        address,
        contractAddress: proof.contractAddress,
        index: proof.index,
        proofsCount: proof.proofs.length,
      },
      'Successfully retrieved proof for address and contract'
    )

    return this.parseResponse({
      contractAddress: proof.contractAddress,
      index: proof.index,
      amount,
      proofs: proof.proofs,
    })
  }

  parseResponse(data: ParseSchemaT): ResponseSchemaT {
    return {
      data: {
        ...data,
      },
      message: messages.PROOF_RETRIEVED_SUCCESSFULLY,
    }
  }
}

export { endpoint }
