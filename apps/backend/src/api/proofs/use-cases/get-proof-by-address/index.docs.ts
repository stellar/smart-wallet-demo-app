import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { ResponseSchema } from './types'

export default {
  get: {
    tags: [Tags.PROOFS],
    summary: 'Get Merkle proof for a specific address',
    description:
      'Retrieves the Merkle proof data needed to claim tokens from the configured airdrop contract. Requires authentication.',
    parameters: [
      {
        name: 'address',
        in: 'path',
        required: true,
        description: 'Stellar address of the recipient (Ed25519 public key or contract address format)',
        schema: {
          type: 'string',
          pattern: '^[GCAM][A-Z2-7]{55}$',
          example: 'CAASCQKVVBSLREPEUGPOTQZ4BC2NDBY2MW7B2LGIGFUPIY4Z3XUZRVTX',
        },
      },
    ],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Proof retrieved successfully',
        content: {
          'application/json': {
            schema: zodToSchema(ResponseSchema),
            example: {
              data: {
                contractAddress: 'CAI2ZXTG5DJ5LLIJG25OJG3K5JLTQZKXGZVI4X556GIBSJNVFKE6445I',
                index: 2,
                amount: 150000000,
                proofs: ['7dc507d7ac72251c1e53ac4809008d6cc77fa95102797da00d64707d1c751b47'],
              },
              message: 'Proof retrieved successfully',
            },
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: 'Proof not found for the specified address',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'The requested resource was not found',
                },
                details: {
                  type: 'string',
                  example: 'Proof not found for address and contract',
                },
              },
            },
          },
        },
      },
      [HttpStatusCodes.UNAUTHORIZED]: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: "You don't have permission to do this action",
                },
                details: {
                  type: 'string',
                  example: 'Invalid token',
                },
              },
            },
          },
        },
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        description: 'Invalid request parameters',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'The payload has validation errors',
                },
                code: {
                  type: 'number',
                  example: 2,
                },
                fields: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          code: {
                            type: 'string',
                            example: 'custom',
                          },
                          message: {
                            type: 'string',
                            example: 'Invalid Stellar address format',
                          },
                          path: {
                            type: 'array',
                            items: {
                              type: 'string',
                            },
                            example: ['address'],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerToken: [],
      },
    ],
  },
}
