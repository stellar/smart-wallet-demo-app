import { StrKey } from '@stellar/stellar-sdk'
import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

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

export const ParseSchema = z.object({
  contractAddress: stellarContractAddressSchema,
  index: z.number().int().min(0),
  amount: z.number().int().positive(),
  proofs: z.array(hashSchema),
})

export type ParseSchemaT = z.infer<typeof ParseSchema>

export const RequestSchema = z.object({
  address: stellarAddressSchema,
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(ParseSchema)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
