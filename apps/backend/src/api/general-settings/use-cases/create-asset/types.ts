import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { assetSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  name: z.string(),
  code: z.string(),
  type: z.string(),
  contract_address: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    asset: assetSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
