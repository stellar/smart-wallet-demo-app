import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const TransactionSchema = z.object({
  hash: z.string(),
  type: z.string(),
  amount: z.string(),
  date: z.string(),
  vendor: z.string(),
  asset: z.string(),
})

export type TransactionSchemaT = z.infer<typeof TransactionSchema>

export const ParseSchema = z.object({
  address: z.string(),
  transactions: z.array(TransactionSchema),
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
