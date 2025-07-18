import { ZodSchema, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

/**
 * Use this method to convert zod validation schemas to swagger docs
 * @param zodSchema
 */
export const zodToSchema = (zodSchema: ZodSchema<unknown, ZodTypeDef, unknown>): Record<string, unknown> =>
  zodToJsonSchema(zodSchema)

export const refineJsonString = (value: string) => {
  try {
    if (value) {
      JSON.parse(value)
      return true
    }

    return true
  } catch {
    return false
  }
}
