import * as yup from 'yup'

// Transfer Type schema
export const transferTypeSchema = yup.object({
  type: yup.string().required(),
  amount: yup.number().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
  product: yup.string().optional(),
})

// TODO: replace with real NFT model schema
// Nft Type schema
export const nftTypeSchema = yup.object({
  type: yup.string().required(),
  id: yup.string().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
})

// Swag Type schema
export const swagTypeSchema = yup.object({
  type: yup.string().required(),
  amount: yup.number().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
})
