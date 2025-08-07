import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const NftSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.number(),
  issuer: z.string(),
  code: z.string(),
})

export type NftSchemaT = z.infer<typeof NftSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    nfts: z.array(NftSchema),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
