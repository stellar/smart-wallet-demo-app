import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(z.object({}))

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
