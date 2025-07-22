import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

export const ParseSchema = z.object({
  status: z.nativeEnum(WalletStatus),
  address: z.string().optional(),
  balance: z.string().optional(),
  email: z.string().optional(),
})

export type ParseSchemaT = z.infer<typeof ParseSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  ParseSchema
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
