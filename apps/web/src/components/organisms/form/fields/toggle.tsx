import { Controller, useFormContext } from 'react-hook-form'
import { Toggle as SDSToggle } from '@stellar/design-system'
import { useFormContextExtra } from '../provider'

type Props = {
  name: string
} & Omit<React.ComponentProps<typeof SDSToggle>, 'id' | 'checked' | 'onChange'>

export function Toggle({ name, ...props }: Props) {
  const { control } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SDSToggle
          id={name}
          checked={field.value}
          onChange={field.onChange}
          disabled={formSubmitting || props.disabled}
          {...props}
        />
      )}
    />
  )
}
