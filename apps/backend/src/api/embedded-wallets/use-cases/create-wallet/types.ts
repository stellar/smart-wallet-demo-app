import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'
import { refineJsonString } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  email: z.string().email(),
  registration_response_json: z.string().refine(refineJsonString),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    status: z.nativeEnum(WalletStatus),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
