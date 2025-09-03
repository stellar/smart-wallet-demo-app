import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { productSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    products: productSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
