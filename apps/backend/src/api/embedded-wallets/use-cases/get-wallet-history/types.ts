import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

// Type for function arguments returned by extractOperationData
export interface FunctionArg {
  type: string
  value: string
  raw: string
}

export const TokenData = z.object({
  name: z.string(),
  description: z.string(),
  symbol: z.string(),
  contract_address: z.string(),
  image_url: z.string(),
  session_id: z.string(),
  resource: z.string(),
})

export const TransactionSchema = z.object({
  hash: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  vendor: z.string().optional(),
  asset: z.string(),
  product: z.object({}).optional(),
  token: TokenData.optional(),
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
