import { badRequest, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'List NFTs for the authenticated user',
    description: 'Retrieves a list of all NFTs owned by the authenticated user. The user must be authenticated and have a valid wallet address. Returns an empty array if the user has no NFTs or no wallet.',
    responses: {
      [HttpStatusCodes.OK]: {
        type: 'object',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
        description: 'Successfully retrieved the list of NFTs',
      },
      ...unauthorized,
      ...badRequest,
      ...notFound,
    },
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: zodToSchema(RequestSchema),
        },
      },
      description: 'User email for NFT retrieval (extracted from authentication token)',
    },
    security: [
      {
        BearerToken: [],
      },
    ],
  },
}
