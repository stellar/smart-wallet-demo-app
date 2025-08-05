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
  amount: z.string(),
})

const nftTypeSchema = z.object({
  ...baseSchema,
  type: z.enum(['nft']),
  id: z.string(),
})

export const RequestSchema = z.union([transferTypeSchema, nftTypeSchema])

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    hash: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
