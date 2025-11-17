import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { featureFlagSchema } from 'api/core/utils/zod'

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
    flag: featureFlagSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
