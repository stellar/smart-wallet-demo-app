import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { refineJsonString } from 'api/core/utils/zod'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

export const RequestSchema = z.object({
  email: z.string().email(),
  registration_response_json: z.string().refine(refineJsonString),
  token: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    status: z.nativeEnum(WalletStatus),
    token: z.string(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
