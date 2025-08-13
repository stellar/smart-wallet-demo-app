import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  featureFlagId: z.string(),
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    flag: z.object({
      featureFlagId: z.string(),
      name: z.string(),
      isActive: z.boolean(),
      description: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
