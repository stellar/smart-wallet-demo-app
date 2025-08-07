import * as yup from 'yup'

// Transfer Type schema
export const transferTypeSchema = yup.object({
  type: yup.string().required(),
  amount: yup.number().required(),
  asset: yup.string().required(),
  to: yup.string().required(),
})
