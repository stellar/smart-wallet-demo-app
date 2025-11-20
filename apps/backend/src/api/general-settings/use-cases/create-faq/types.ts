import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { faqSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number().int().min(0).optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    faq: faqSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
