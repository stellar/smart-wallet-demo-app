import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const ResponseSchema = createResponseSchema(
  z.object({
    flags: z
      .object({
        id: z.string(),
        name: z.string(),
        is_active: z.boolean(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
      .array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
