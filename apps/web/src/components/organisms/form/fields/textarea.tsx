import { Controller, useFormContext } from 'react-hook-form'
import { Textarea as SDSTextarea } from '@stellar/design-system'
import { useFormContextExtra } from '../provider'

type Props = {
  name: string
  label?: string
} & Omit<React.ComponentProps<typeof SDSTextarea>, 'id'>

export function Textarea({ name, label, ...props }: Props) {
  const { control, formState } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()
  const error = formState.errors[name]?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SDSTextarea
          id={name}
          label={label}
          error={error}
          disabled={formSubmitting || props.disabled}
          {...field}
          {...props}
        />
      )}
    />
  )
}
