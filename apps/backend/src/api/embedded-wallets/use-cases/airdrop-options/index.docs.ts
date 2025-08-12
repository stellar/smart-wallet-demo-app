import { badRequest, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Get airdrop claim options',
    description: 'Validates eligibility and generates WebAuthn challenge for airdrop claim',
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully retrieved airdrop claim options with WebAuthn challenge',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
      },
      ...unauthorized,
      ...badRequest,
      ...notFound,
    },
    security: [
      {
        BearerToken: [],
      },
    ],
  },
}
