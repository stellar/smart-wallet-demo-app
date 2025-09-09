import { z } from 'zod'

import { nftMetadataSchema } from 'api/core/utils/zod'

export const RequestSchema = z.object({
  id: z.string(),
  resource: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = nftMetadataSchema

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
