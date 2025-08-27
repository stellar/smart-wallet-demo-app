import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { ngoSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  name: z.string(),
  description: z.string(),
  wallet_address: z.string(),
  profile_image: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    ngo: ngoSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
