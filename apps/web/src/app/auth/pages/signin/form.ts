import * as yup from 'yup'

import { useForm } from 'src/components/organisms'

export const validationSchema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required()

export type SigninFormType = yup.InferType<typeof validationSchema>

export const useSignInForm = () => {
  return useForm({
    validationSchema,
  })
}
