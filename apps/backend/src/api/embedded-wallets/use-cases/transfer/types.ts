import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { refineJsonString } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  email: z.string(),
  type: z.string(),
  asset: z.string(),
  to: z.string(),
  amount: z.number(),
  authentication_response_json: z.string().refine(refineJsonString),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    hash: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
