import { badRequest, conflict, notFound, unauthorized } from 'api/core/utils/docs/error.docs'
import { Tags } from 'api/core/utils/docs/tags'
import { HttpStatusCodes } from 'api/core/utils/http/status-code'
import { zodToSchema } from 'api/core/utils/zod'

import { RequestSchema, ResponseSchema } from './types'

export const CreateAccountDocs = {
  '/embedded-wallets/create-account': {
    post: {
      summary: 'Create Stellar Account',
      description: 'Creates a new Stellar (G) account. Each user can create only one account.',
      tags: [Tags.EMBEDDED_WALLETS],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: zodToSchema(RequestSchema),
          },
        },
      },
      responses: {
        [HttpStatusCodes.OK]: {
          description: 'Account created successfully',
          content: {
            'application/json': {
              schema: zodToSchema(ResponseSchema),
            },
          },
        },
        ...unauthorized,
        ...badRequest,
        ...conflict,
        ...notFound,
      },
    },
  },
}
