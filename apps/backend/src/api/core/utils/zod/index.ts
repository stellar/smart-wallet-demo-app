import { ZodSchema, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

/**
 * Use this method to convert zod validation schemas to swagger docs
 * @param zodSchema
 */
export const zodToSchema = (zodSchema: ZodSchema<unknown, ZodTypeDef, unknown>): Record<string, unknown> =>
  zodToJsonSchema(zodSchema)
