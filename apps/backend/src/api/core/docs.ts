import EmbeddedWallets from 'api/embedded-wallets/docs'
import Proofs from 'api/proofs/docs'

import { HttpStatusCodes } from './utils/http/status-code'

export default {
  '/health': {
    get: {
      summary: 'Health Check',
      description: 'Check if the API is running and healthy.',
      responses: {
        [HttpStatusCodes.OK]: {
          description: 'API is healthy',
        },
      },
    },
  },
  ...EmbeddedWallets,
  ...Proofs,
}
