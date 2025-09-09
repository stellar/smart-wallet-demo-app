import { StrKey } from '@stellar/stellar-sdk'
import { z, ZodSchema, ZodTypeDef } from 'zod'
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

export const stellarAddressSchema = z
  .string()
  .min(1, 'Address is required')
  .refine(address => {
    try {
      return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address)
    } catch {
      return false
    }
  }, 'Invalid Stellar address format')

export const stellarContractAddressSchema = z.string().refine(address => {
  try {
    return StrKey.isValidContract(address)
  } catch {
    return false
  }
}, 'Invalid Stellar contract address format')

export const hashSchema = z
  .string()
  .length(64, 'Hash must be exactly 64 characters')
  .regex(/^[a-f0-9]{64}$/, 'Hash must be a valid lowercase hex string')

export const verificationIdSchema = z.string().min(1, 'Verification ID is required')

export const merkleProofDataSchema = z.object({
  contractAddress: stellarContractAddressSchema,
  index: z.number().int().min(0),
  amount: z.number().int().positive(),
  proofs: z.array(hashSchema),
})

export const featureFlagSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  is_active: z.boolean(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const assetSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  code: z.string(),
  type: z.string().optional(),
  contract_address: z.string().optional(),
})

export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  wallet_address: z.string().optional(),
  profile_image: z.string().optional(),
})

export const productSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  image_url: z.string().optional(),
  description: z.string().optional(),
  is_swag: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
  asset: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      code: z.string().optional(),
      type: z.string().optional(),
      contract_address: z.string().optional(),
    })
    .optional(),
})

export const ngoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  wallet_address: z.string(),
  profile_image: z.string().optional(),
})

export const nftSupplySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  code: z.string(),
  contract_address: z.string(),
  session_id: z.string(),
  resource: z.string(),
  total_supply: z.number().int().min(1),
  minted_amount: z.number().int().min(0).optional(),
  issuer: z.string(),
})

export const leaderboardSchema = z.object({
  id: z.string(),
  email: z.string(),
  contract_address: z.string(),
  token_count: z.number(),
})

export const nftMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  external_url: z.string(),
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.string().or(z.number()).or(z.boolean()),
      })
    )
    .optional(),
})

export type MerkleProofDataT = z.infer<typeof merkleProofDataSchema>
