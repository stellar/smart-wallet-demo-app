import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { nftSupplySchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  code: z.string(),
  contract_address: z.string(),
  session_id: z.string(),
  resource: z.string(),
  total_supply: z.number().int().min(1),
  issuer: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    nft_collection: nftSupplySchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
