import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const NftSchema = z.object({
  token_id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  code: z.string(), // Symbol
  contract_address: z.string().optional(),
  transaction_hash: z.string().optional(),
  issuer: z.string().optional(),
  resource: z.string().optional(),
})

export type NftSchemaT = z.infer<typeof NftSchema>

export const RequestSchema = z.object({
  email: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    nfts: z.array(NftSchema),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
