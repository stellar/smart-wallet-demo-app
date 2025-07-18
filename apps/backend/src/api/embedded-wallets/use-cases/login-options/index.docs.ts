import { badRequest, notFound } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'
import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Get log in options',
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
    parameters: [
      {
        in: 'path',
        name: 'email',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
  },
}
