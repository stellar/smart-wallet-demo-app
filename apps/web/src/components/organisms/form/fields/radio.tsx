import { Controller, useFormContext } from 'react-hook-form'
import { RadioButton as SDSRadio } from '@stellar/design-system'
import { useFormContextExtra } from '../provider'

type Option = { label: string; value: string } & React.ComponentProps<typeof SDSRadio>

type Props = {
  name: string
  options: Option[]
  disabled?: boolean
}

export function Radio({ name, options, disabled }: Props) {
  const { control } = useFormContext()
  const { submitting: formSubmitting } = useFormContextExtra()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          {options.map(({ id, ...option }) => (
            <SDSRadio
              key={option.value}
              id={id || `${name}-${option.value}`}
              checked={field.value === option.value}
              disabled={formSubmitting || disabled}
              onChange={() => field.onChange(option.value)}
              {...option}
            />
          ))}
        </>
      )}
    />
  )
}
