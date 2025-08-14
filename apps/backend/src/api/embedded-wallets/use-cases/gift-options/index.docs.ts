import { badRequest, conflict, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Get gift claim options',
    description:
      'Validates gift eligibility, reserves gift for claiming, checks claim status, and generates WebAuthn challenge for gift claim',
    parameters: [
      {
        in: 'query',
        name: 'giftId',
        required: true,
        schema: {
          type: 'string',
        },
        description: 'Unique gift verification identifier',
      },
    ],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully retrieved gift claim options with WebAuthn challenge',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
      },
      ...unauthorized,
      ...badRequest,
      ...notFound,
      ...conflict,
    },
    security: [
      {
        BearerToken: [],
      },
    ],
  },
}
