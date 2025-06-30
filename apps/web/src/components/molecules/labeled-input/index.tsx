import * as React from 'react'

import { Status as InputStatus } from 'src/constants/enums/status'
import { cn } from 'src/helpers/style'

import { Typography, TypographyVariant } from 'src/components/atoms'
import { IInputProps } from 'src/components/types/input'

import styles from './styles.module.css'

export interface ILabeledInputProps {
  className?: string
  input: React.ReactElement<IInputProps>
  label: string
  status: InputStatus
  helperText?: string
  htmlFor?: string
}

const LabeledInput: React.FunctionComponent<ILabeledInputProps> = ({
  className,
  input,
  label,
  status,
  helperText,
  htmlFor,
}) => {
  const childInput = <span className={styles.inputContainer}>{input}</span>
  return (
    <div className={cn(styles.container, className)}>
      {label ? (
        <Typography asChild status={status} variant={TypographyVariant.label}>
          <label className={styles.label} aria-labelledby={htmlFor}>
            {label}
            {childInput}
          </label>
        </Typography>
      ) : (
        childInput
      )}
      {/* TODO: add status of helperText */}
      <span className={styles.helperText}>{helperText}</span>
    </div>
  )
}

export { InputStatus, LabeledInput }
