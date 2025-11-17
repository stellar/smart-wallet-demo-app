import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
})

export const ResponseSchema = createResponseSchema(
  z.object({
    final_url: z.string().url(),
  })
)

export type RequestSchemaT = z.infer<typeof RequestSchema>
export type ResponseSchemaT = z.infer<typeof ResponseSchema>
