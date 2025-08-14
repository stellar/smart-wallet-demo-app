import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    flag: z.object({
      name: z.string(),
      is_active: z.boolean(),
      description: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
