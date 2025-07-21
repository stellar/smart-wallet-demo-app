import { StrKey } from '@stellar/stellar-sdk'
import { z } from 'zod'

import { logger } from '../../config/logger'
import { UseCaseBase } from '../core/framework/use-case/base'
import { Request, Response } from '../core/routes'
import ProofRepository from '../core/services/proof'
import { HttpStatusCodes } from '../core/utils/http/status-code'

const stellarAddressSchema = z
  .string()
  .min(1, 'Address is required')
  .refine(address => {
    try {
      return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address)
    } catch {
      return false
    }
  }, 'Invalid Stellar address format')

const GetProofByAddressParamsSchema = z.object({
  address: stellarAddressSchema,
})

const stellarContractAddressSchema = z.string().refine(address => {
  try {
    return StrKey.isValidContract(address)
  } catch {
    return false
  }
}, 'Invalid Stellar contract address format')

const hashSchema = z
  .string()
  .length(64, 'Hash must be exactly 64 characters')
  .regex(/^[a-f0-9]{64}$/, 'Hash must be a valid hex string')
  .refine(hash => {
    try {
      const buffer = Buffer.from(hash, 'hex')
      return buffer.length === 32
    } catch {
      return false
    }
  }, 'Invalid hash format')

const ProofDataSchema = z.object({
  contractAddress: stellarContractAddressSchema,
  index: z.number().int().min(0),
  amount: z.number().int().positive(),
  proofs: z.array(hashSchema),
})

const ErrorResponseSchema = z.object({
  message: z.string(),
})

const _GetProofByAddressResponseSchema = z.union([ProofDataSchema, ErrorResponseSchema])

export type GetProofByAddressInput = z.infer<typeof GetProofByAddressParamsSchema>
export type GetProofByAddressOutput = z.infer<typeof _GetProofByAddressResponseSchema>

export class GetProofByAddressUseCase extends UseCaseBase<GetProofByAddressOutput> {
  private proofRepository: ProofRepository

  constructor() {
    super()
    this.proofRepository = new ProofRepository()
  }

  async handle(req: Request, res: Response): Promise<GetProofByAddressOutput> {
    this.setRequestId(req)

    const validatedParams = this.validate(req.params, GetProofByAddressParamsSchema)
    const { address } = validatedParams

    logger.info({ requestId: this.requestId, address }, 'Fetching proof for address')

    try {
      const proof = await this.proofRepository.findByAddress(address)

      if (!proof) {
        logger.warn({ requestId: this.requestId, address }, 'Proof not found for address')
        const errorResponse = { message: 'Proof not found for address' }
        res.status(HttpStatusCodes.NOT_FOUND).json(errorResponse)
        return errorResponse
      }

      const proofData = {
        contractAddress: proof.contractAddress,
        index: proof.index,
        amount: Number(proof.receiverAmount),
        proofs: proof.proofs,
      }

      const validatedOutput = this.validate(proofData, ProofDataSchema)

      logger.info(
        {
          requestId: this.requestId,
          address,
          index: proof.index,
          proofsCount: proof.proofs.length,
        },
        'Successfully retrieved proof for address'
      )

      res.status(HttpStatusCodes.OK).json(validatedOutput)
      return validatedOutput
    } catch (error) {
      logger.error({ requestId: this.requestId, address, error }, 'Error fetching proof for address')
      throw error
    }
  }
}
