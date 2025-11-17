import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const NftSupplySchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  code: z.string(),
  contractAddress: z.string(),
  sessionId: z.string(),
  resource: z.string(),
})

export const RequestSchema = z.object({
  email: z.string(),
  supply_id: z.string().optional(),
  session_id: z.string().optional(),
  resource: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    nft: NftSupplySchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
