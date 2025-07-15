import { FieldValues, FormProvider as RHFFormProvider, useForm } from 'react-hook-form'

import { FormProvider } from './provider'

// Import fields
import { Input } from './fields/input'
import { Checkbox } from './fields/checkbox'
import { Radio } from './fields/radio'
import { Select } from './fields/select'
import { Textarea } from './fields/textarea'
import { Toggle } from './fields/toggle'
import { Submit } from './submit'

type FormProps<T extends FieldValues> = {
  form: ReturnType<typeof useForm<T>>
  onSubmit: (values: T) => void
  children: React.ReactNode
}

function BaseForm<T extends Record<string, unknown>>({ form, onSubmit, children }: FormProps<T>) {
  return (
    <RHFFormProvider {...form}>
      <FormProvider submitting={form.formState.isSubmitting}>
        <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
      </FormProvider>
    </RHFFormProvider>
  )
}

// Attach fields as static properties
export const Form = Object.assign(BaseForm, {
  Input,
  Checkbox,
  Radio,
  Select,
  Textarea,
  Toggle,
  Submit,
})
