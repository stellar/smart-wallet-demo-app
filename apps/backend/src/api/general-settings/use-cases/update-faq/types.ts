import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { faqSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    faq: faqSchema.omit({ id: true }),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
