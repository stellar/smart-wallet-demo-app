import * as React from 'react'

import { cn } from 'src/helpers/style'

import { IInputProps } from 'src/components/types/input'

import styles from './styles.module.css'

export interface IInputTextProps extends IInputProps {
  htmlType?: string
}

const InputText = React.forwardRef<HTMLInputElement, IInputTextProps>(
  ({ name, onChange, onBlur, htmlType = 'text', disabled = false, className, id, ...restProps }, ref): JSX.Element => (
    <div className={cn(styles.inputContainer, { [styles.disabled]: disabled }, styles[status])}>
      <input
        id={id ?? name}
        className={cn(styles.input, className)}
        onChange={onChange}
        onBlur={onBlur}
        type={htmlType}
        name={name}
        disabled={disabled}
        {...restProps}
        ref={ref}
      />
    </div>
  )
)

InputText.displayName = 'InputText'

export { InputText }
