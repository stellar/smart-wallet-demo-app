import { badRequest, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export default {
  post: {
    tags: [Tags.EMBEDDED_WALLETS],
    summary: 'Claim an NFT',
    description: `Claims an NFT for the authenticated user by minting it to their wallet address. 
    
This endpoint performs the following operations:
1. Validates user authentication and wallet ownership
2. Checks NFT supply availability
3. Verifies user hasn't already claimed an NFT from the same session
4. Simulates the mint transaction on the Soroban blockchain
5. Creates NFT records in the database
6. Executes the mint transaction on-chain
7. Updates NFT supply counts

The process is wrapped in a database transaction to ensure data consistency. If any step fails, all changes are rolled back.`,
    responses: {
      [HttpStatusCodes.OK]: {
        type: 'object',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
          },
        },
        description: 'NFT claimed successfully. Returns the transaction hash and minted token ID.',
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
          description: 'NFT claim request parameters',
        },
      },
    },
    security: [
      {
        BearerToken: [],
      },
    ],
    parameters: [
      {
        name: 'session_id',
        in: 'body',
        required: true,
        description: 'Unique identifier for the NFT session/collection',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'resource',
        in: 'body',
        required: true,
        description: 'Resource identifier or contract address for the NFT collection',
        schema: {
          type: 'string',
        },
      },
    ],
    examples: {
      'application/json': {
        summary: 'Example NFT claim request',
        value: {
          session_id: 'session_123',
          resource: 'contract_address_or_resource_id',
        },
      },
    },
  },
}
