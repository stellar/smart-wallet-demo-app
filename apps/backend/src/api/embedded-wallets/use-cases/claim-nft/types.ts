import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  email: z.string(),
  supply_id: z.string().optional(),
  session_id: z.string().optional(),
  resource: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    hash: z.string(),
    tokenId: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
