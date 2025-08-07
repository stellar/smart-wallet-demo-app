import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { refineJsonString } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  email: z.string(),
  type: z.string(),
  asset: z.string(),
  to: z.string(),
  amount: z.number(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    options_json: z.string().refine(refineJsonString),
    user: z.object({
      address: z.string(),
      email: z.string().email(),
      balance: z.number().positive(),
    }),
    vendor: z
      .object({
        name: z.string().optional(),
        wallet_address: z.string().optional(),
        profile_image: z.string().optional(),
      })
      .optional(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
