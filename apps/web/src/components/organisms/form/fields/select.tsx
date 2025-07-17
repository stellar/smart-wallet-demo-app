import { Select as SDSSelect } from '@stellar/design-system'
import { ChangeEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { useFormContextExtra } from '../provider'

type Props = {
  name: string
} & Omit<React.ComponentProps<typeof SDSSelect>, 'id' | 'value' | 'onChange'>

export function Select({ name, ...props }: Props) {
  const { control, formState } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()
  const error = formState.errors[name]?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SDSSelect
          id={name}
          value={field.value}
          onChange={(event: ChangeEvent) => field.onChange(event)}
          error={error}
          disabled={formSubmitting || props.disabled}
          {...props}
        />
      )}
    />
  )
}
