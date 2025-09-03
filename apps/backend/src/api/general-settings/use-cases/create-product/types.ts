import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { productSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  code: z.string(),
  name: z.string().optional(),
  image_url: z.string().optional(),
  description: z.string().optional(),
  is_swag: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
  asset_id: z.string().optional(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    product: productSchema,
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
