import * as React from 'react'

import { cn } from 'src/helpers/style'

import { IInputProps } from 'src/components/types/input'

export interface IInputRadioProps extends IInputProps {
  children?: React.ReactNode | React.ReactNode[]
  checkboxClassName?: string
  checkboxDotClassName?: string
}

const InputRadio = React.forwardRef<HTMLInputElement, IInputRadioProps>(
  ({ name, onChange, onBlur, disabled = false, className, id, children, value, ...restProps }, ref): JSX.Element => {
    return (
      <div className={cn('text-white', className)}>
        <label className="flex align-center align-middle gap-2">
          <input
            id={id ?? name}
            onChange={onChange}
            onBlur={onBlur}
            type="radio"
            name={name}
            disabled={disabled}
            {...restProps}
            ref={ref}
            value={value}
          />
          {children}
        </label>
      </div>
    )
  }
)

InputRadio.displayName = 'InputRadio'

export { InputRadio }
