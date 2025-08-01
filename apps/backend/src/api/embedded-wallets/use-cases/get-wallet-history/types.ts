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
  sendOrReceive: z.string().optional(),
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
