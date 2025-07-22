import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { STELLAR } from 'config/stellar'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    status: z.nativeEnum(WalletStatus),
    address: z.string().optional(),
    balance: z.string().optional(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
