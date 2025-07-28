import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const ParseSchema = z.object({
  address: z.string(),
  transactions: z.array(z.object({})), // TODO: Define a more specific schema for transactions. Get vendor data from backoffice.
})

export type ParseSchemaT = z.infer<typeof ParseSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    address: z.string(),
    transactions: z.array(z.object({})),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
