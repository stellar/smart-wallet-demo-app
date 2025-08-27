import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { nftSupplySchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    nft_collections: nftSupplySchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
