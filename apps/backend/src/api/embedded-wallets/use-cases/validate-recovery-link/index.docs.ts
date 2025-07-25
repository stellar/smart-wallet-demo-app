import { badRequest, notFound } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Validate a recovery link',
    description: 'Validates a recovery link for the user. The user must have a valid wallet and an active OTP.',
    responses: {
      [HttpStatusCodes.OK]: {
        type: 'object',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
      },
      ...badRequest,
      ...notFound,
    },
    requestBody: {
      content: {
        'application/json': {
          schema: zodToSchema(RequestSchema),
        },
      },
    },
  },
}
