import * as yup from 'yup'

// Transfer Type schema
export const transferTypeSchema = yup.object({
  type: yup.string().required(),
  amount: yup.number().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
  product: yup.string().optional(),
})

// NFT Claim schema
export const nftTypeSchema = yup.object({
  type: yup.string().oneOf(['nft']).required(),
  session_id: yup.string().required(),
  resource: yup.string().required(),
})

// Swag Type schema
export const swagTypeSchema = yup.object({
  type: yup.string().required(),
  amount: yup.number().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
})
