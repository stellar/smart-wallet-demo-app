import { z } from 'zod'

import { createResponseSchema } from 'api/core/framework/use-case/base'
import { vendorSchema } from 'api/core/utils/zod'
import { WalletStatus } from 'interfaces/sdp-embedded-wallets/types'

export const TokenBalance = z.object({
  contract_address: z.string(),
  balance: z.number(),
  type: z.enum(['nft', 'asset']),
})

export type TokenBalanceT = z.infer<typeof TokenBalance>

export const ParseSchema = z.object({
  status: z.nativeEnum(WalletStatus),
  address: z.string(),
  balance: z.number(),
  token_balances: z.array(TokenBalance).optional(),
  email: z.string().email(),
  is_airdrop_available: z.boolean(),
  is_gift_available: z.boolean(),
  swags: z
    .array(
      z.object({
        code: z.string(),
        name: z.string().optional(),
        description: z.string(),
        imageUrl: z.string().optional(),
        assetCode: z.string(),
        status: z.enum(['unclaimed', 'claimed']),
      })
    )
    .optional(),
  vendors: z.array(vendorSchema.omit({ is_active: true })).optional(),
})

export type ParseSchemaT = z.infer<typeof ParseSchema>

export const RequestSchema = z.object({
  id: z.string(),
})

export type RequestSchemaT = z.infer<typeof RequestSchema>

export const ResponseSchema = createResponseSchema(ParseSchema)

export type ResponseSchemaT = z.infer<typeof ResponseSchema>
