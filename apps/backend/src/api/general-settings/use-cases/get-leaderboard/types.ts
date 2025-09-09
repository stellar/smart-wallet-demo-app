import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { leaderboardSchema } from 'api/core/utils/zod'

export const ResponseSchema = createResponseSchema(
  z.object({
    leaderboard: leaderboardSchema.array(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
