import * as React from 'react'

import { cn } from 'src/helpers/style'

import { IInputProps } from 'src/components/types/input'

export interface IInputCheckboxProps extends IInputProps {
  children?: React.ReactNode | React.ReactNode[]
  checkboxClassName?: string
  checkboxDotClassName?: string
}

const InputCheckbox = React.forwardRef<HTMLInputElement, IInputCheckboxProps>(
  ({ name, onChange, onBlur, className, id, children, ...restProps }, ref): JSX.Element => {
    return (
      <div className={cn('flex text-white align-center align-middle', className)}>
        <label className="flex align-center gap-2 cursor-pointer">
          <input
            id={id ?? name}
            onChange={onChange}
            onBlur={onBlur}
            type="checkbox"
            name={name}
            {...restProps}
            ref={ref}
          />
          {children}
        </label>
      </div>
    )
  }
)

InputCheckbox.displayName = 'InputCheckbox'

export { InputCheckbox }
