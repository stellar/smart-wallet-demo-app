import { StrKey } from '@stellar/stellar-sdk'
import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .refine(value => {
      try {
        return StrKey.isValidEd25519PublicKey(value)
      } catch {
        return false
      }
    }, 'Must be a valid Stellar public key'),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    address: z.string(),
    transaction: z.string().optional(),
    networkPassphrase: z.string().optional(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
