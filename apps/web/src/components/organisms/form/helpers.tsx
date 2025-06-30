import * as React from 'react'

import { Control, Controller, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Status } from 'src/constants/enums'

import { LabeledInput } from 'src/components/molecules'

import { UpdateFormEvent } from './types'

const composeEvents =
  (eventA: (e: UpdateFormEvent) => void, eventB?: (e: UpdateFormEvent) => void) =>
  (...args: [UpdateFormEvent]): void => {
    if (eventB) {
      eventB(...args)
    }
    return eventA(...args)
  }

export const cloneElement = <T extends FieldValues>(
  child: React.ReactElement,
  register: UseFormRegister<T>,
  status: Status
): React.ReactElement => {
  const { onChange, onBlur, ...registerProps } = register(child.props.name)
  const composeOnChange = composeEvents(onChange, child.props?.onChange)
  const composeOnBlur = composeEvents(onBlur, child.props?.onBlur)

  return React.cloneElement(child, {
    onChange: composeOnChange,
    onBlur: composeOnBlur,
    status,
    ...registerProps,
  })
}

const cloneWithControl = <T extends FieldValues>(
  child: React.ReactElement,
  control: Control<T>,
  status: Status
): JSX.Element => {
  return (
    <Controller
      control={control}
      name={child.props.name}
      render={({ field: { onChange, onBlur, ...field } }): React.ReactElement => {
        const composeOnChange = composeEvents(onChange, child.props?.onChange)
        const composeOnBlur = composeEvents(onBlur, child.props?.onBlur)

        return React.cloneElement(child, {
          onChange: composeOnChange,
          onBlur: composeOnBlur,
          status,
          ...field,
        })
      }}
    />
  )
}

interface IFormActions<T extends FieldValues = FieldValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  control?: Control<T>
}

export const renderFormElementWithLabel = <T extends FieldValues = FieldValues>(
  child: React.ReactElement,
  { errors, register, control }: IFormActions<T>
): React.ReactElement => {
  const name = child.props.name
  const error = errors[name]?.message
  const status = (error && Status.error) || Status.default

  let input
  if (control) {
    input = cloneWithControl(child, control, status)
  } else {
    input = cloneElement(child, register, status)
  }

  return (
    <LabeledInput
      key={name}
      input={input}
      label={child.props.label}
      status={status}
      helperText={error?.toString()}
      htmlFor={name}
      className={child.props.labeledInputClassName}
    />
  )
}
