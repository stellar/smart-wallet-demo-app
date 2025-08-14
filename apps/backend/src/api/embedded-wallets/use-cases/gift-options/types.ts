import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { verificationIdSchema, refineJsonString } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  email: z.string().email(),
  giftId: verificationIdSchema,
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    options_json: z.string().refine(refineJsonString).nullable(),
    user: z.object({
      address: z.string(),
      email: z.string().email(),
    }),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
