import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

// Type for function arguments returned by extractOperationData
export interface FunctionArg {
  type: string
  value: string
  raw: string
}

export const TransactionSchema = z.object({
  hash: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  vendor: z.string(),
  asset: z.string(),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  sendOrReceive: z.enum(['send', 'receive']).optional(),
})

export type TransactionSchemaT = z.infer<typeof TransactionSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    transactions: z.array(TransactionSchema),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
