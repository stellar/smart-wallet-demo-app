import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { refineJsonString } from 'api/core/utils/zod'

export const enum TransferTypes {
  TRANSFER = 'transfer',
  NFT = 'nft',
  SWAG = 'swag',
}

const baseSchema = {
  email: z.string(),
  asset: z.string(),
  to: z.string(),
}

const transferTypeSchema = z.object({
  ...baseSchema,
  type: z.enum([TransferTypes.TRANSFER]),
  amount: z.number(),
  product: z.string().optional(),
})

const nftTypeSchema = z.object({
  ...baseSchema,
  type: z.enum([TransferTypes.NFT]),
  id: z.union([z.string(),z.array(z.string())]), // tokenID
})

const swagTypeSchema = z.object({
  ...baseSchema,
  type: z.enum([TransferTypes.SWAG]),
  amount: z.number(),
})

export const RequestSchema = z.union([transferTypeSchema, nftTypeSchema, swagTypeSchema])

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(
  z.object({
    options_json: z.string().refine(refineJsonString),
    user: z.object({
      address: z.string(),
      email: z.string().email(),
      balance: z.number().positive(),
    }),
    vendor: z
      .object({
        name: z.string().optional(),
        wallet_address: z.string().optional(),
        profile_image: z.string().optional(),
      })
      .optional(),
    products: z
      .array(
        z.object({
          product_id: z.string(),
          code: z.string(),
          name: z.string().optional(),
          description: z.string(),
        })
      )
      .optional(),
  })
)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
