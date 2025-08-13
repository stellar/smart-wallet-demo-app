import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const ResponseSchema = createResponseSchema(
  z.object({
    flags: z
      .object({
        name: z.string(),
        isActive: z.boolean(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
      .array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
