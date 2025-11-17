import { Checkbox as SDSCheckbox } from '@stellar/design-system'
import { Controller, useFormContext } from 'react-hook-form'

import { useFormContextExtra } from '../provider'

type Props = {
  name: string
  label?: string
} & Omit<React.ComponentProps<typeof SDSCheckbox>, 'id' | 'checked' | 'onChange'>

export function Checkbox({ name, label, ...props }: Props) {
  const { control, formState } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()
  const error = formState.errors[name]?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SDSCheckbox
          id={name}
          label={label}
          error={error}
          checked={field.value}
          onChange={field.onChange}
          disabled={formSubmitting || props.disabled}
          {...props}
        />
      )}
    />
  )
}
