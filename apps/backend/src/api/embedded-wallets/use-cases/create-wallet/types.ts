import { z } from 'zod'
import { createResponseSchema } from 'api/core/framework/use-case/base'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

export const RequestSchema = z.object({
  token: z.string(),
  public_key: z.string(),
  credential_id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    status: z.nativeEnum(WalletStatus),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
