import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  email: z.string(),
  session_id: z.string(),
  resource: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    hash: z.string(),
    tokenId: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
