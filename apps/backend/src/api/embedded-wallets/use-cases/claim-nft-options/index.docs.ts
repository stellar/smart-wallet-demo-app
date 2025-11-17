import { badRequest, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Get NFT claim options for a user',
    description:
      'Retrieves available NFT options that a user can claim. This endpoint validates user eligibility, wallet status, and NFT supply availability before returning the NFT options.',
    parameters: [
      {
        name: 'session_id',
        in: 'query',
        required: true,
        description: 'The session identifier for the NFT claim',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'resource',
        in: 'query',
        required: true,
        description: 'The resource identifier or contract address for the NFT collection',
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'NFT options retrieved successfully',
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
