import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { assetSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  code: z.string().optional(),
  type: z.string().optional(),
  contract_address: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    asset: assetSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
