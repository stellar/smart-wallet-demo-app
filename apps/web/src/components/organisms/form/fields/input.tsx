import { Controller, useFormContext } from 'react-hook-form'
import { Input as SDSInput } from '@stellar/design-system'
import { BlurredInput } from 'src/components/molecules'
import { useFormContextExtra } from '../provider'

type Props = {
  name: string
  variant?: 'default' | 'blurred'
  label?: string
} & Omit<React.ComponentProps<typeof SDSInput>, 'id'>

export function Input({ name, variant = 'default', label, ...props }: Props) {
  const { control, formState } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()
  const error = formState.errors[name]?.message as string

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) =>
        variant === 'default' ? (
          <SDSInput
            id={name}
            label={label}
            error={error}
            disabled={formSubmitting || props.disabled}
            {...field}
            {...props}
          />
        ) : (
          <BlurredInput
            id={name}
            label={label}
            error={error}
            disabled={formSubmitting || props.disabled}
            {...field}
            {...props}
          />
        )
      }
    />
  )
}
