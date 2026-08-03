import { badRequest, tooManyRequests } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Generate and send a recovery link',
    description:
      'Generates a recovery link and sends it to the given email address if it belongs to a wallet ' +
      'eligible for recovery. Always responds with a generic success to avoid leaking account existence ' +
      'or state; rate-limited by IP.',
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
      ...tooManyRequests,
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
