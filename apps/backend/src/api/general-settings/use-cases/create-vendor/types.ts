import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { vendorSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  name: z.string(),
  wallet_address: z.string().optional(),
  profile_image: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    vendor: vendorSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
