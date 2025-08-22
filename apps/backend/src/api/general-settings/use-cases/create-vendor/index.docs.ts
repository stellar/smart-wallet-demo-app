import { badRequest, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.ADMIN],
    summary: 'Create vendor',
    description: 'Creates a new vendor in the system.',
    responses: {
      [HttpStatusCodes.CREATED]: {
        type: 'object',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
      },
      ...unauthorized,
      ...badRequest,
    },
    requestBody: {
      content: {
        'application/json': {
          schema: zodToSchema(RequestSchema),
        },
      },
    },
    security: [
      {
        ApiKey: [],
      },
    ],
  },
}
