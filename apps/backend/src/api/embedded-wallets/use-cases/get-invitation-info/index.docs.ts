import { badRequest, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Get invitation info',
    responses: {
      [HttpStatusCodes.OK]: {
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
    parameters: [
      {
        in: 'path',
        name: 'token',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
  },
}
