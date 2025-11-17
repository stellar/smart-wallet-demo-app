import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  email: z.string().email(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    email_sent: z.boolean(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
