import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { assetSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    assets: assetSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
