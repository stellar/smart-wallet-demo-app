import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const ResponseSchema = createResponseSchema(
  z
    .object({
      address: z.string(),
      balance: z.number(),
      email: z.string().email(),
    })
    .array()
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
