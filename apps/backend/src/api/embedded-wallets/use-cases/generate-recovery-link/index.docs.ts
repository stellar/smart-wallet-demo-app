import { badRequest, conflict, notFound } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Generate and send a recovery link',
    description:
      'Generates a recovery link for the user and sends it to their email address. The user must have a valid wallet and no active OTPs.',
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
      ...conflict,
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
