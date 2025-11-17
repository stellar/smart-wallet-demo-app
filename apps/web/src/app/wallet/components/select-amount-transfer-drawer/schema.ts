import * as yup from 'yup'

// Schema definition
export const transferAmountFormSchema = yup.object({
  amount: yup.number().required('Amount is required'),
})

export type TransferAmountFormValues = yup.InferType<typeof transferAmountFormSchema>
