import * as yup from 'yup'

// Schema definition
export const schema = yup.object({
  email: yup.string().required('Email is required').email('Email is invalid'),
})

export type FormValues = yup.InferType<typeof schema>
