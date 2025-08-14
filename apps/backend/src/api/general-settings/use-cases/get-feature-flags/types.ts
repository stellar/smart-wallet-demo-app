import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { featureFlagSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    flags: featureFlagSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
