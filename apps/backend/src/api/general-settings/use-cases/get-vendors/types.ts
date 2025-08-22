import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { vendorSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    vendors: vendorSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
