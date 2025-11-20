import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { faqSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    faqs: faqSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
