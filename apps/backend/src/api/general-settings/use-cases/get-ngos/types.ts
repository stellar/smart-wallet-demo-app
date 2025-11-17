import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { ngoSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    ngos: ngoSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
