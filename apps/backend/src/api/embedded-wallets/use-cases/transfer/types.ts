import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { refineJsonString } from 'api/core/utils/zod'

const baseSchema = {
  email: z.string(),
  asset: z.string(),
  to: z.string(),
  authentication_response_json: z.string().refine(refineJsonString),
}

const transferTypeSchema = z.object({
  ...baseSchema,
  type: z.enum(['transfer']),
  amount: z.number(),
  product: z.string().optional(),
})

const nftTypeSchema = z.object({
  ...baseSchema,
  type: z.enum(['nft']),
  id: z.string(),
})

const swagTypeSchema = z.object({
  ...baseSchema,
  type: z.enum(['swag']),
  amount: z.number(),
})

export const RequestSchema = z.union([transferTypeSchema, nftTypeSchema, swagTypeSchema])

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    hash: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
