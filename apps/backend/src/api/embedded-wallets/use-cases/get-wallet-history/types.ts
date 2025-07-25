import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
// import { GetTransactionsResponse, AccountWithTransactions } from 'interfaces/wallet-backend/types'

export const ParseSchema = z.object({
  address: z.string(),
  transactions: z.array(z.object({})),
})

export type ParseSchemaT = z.infer<typeof ParseSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    address: z.string(),
    transactions: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
