import * as React from 'react'

export type IFormControlCommonProps<
  TIsControlled extends boolean = false,
  TElement extends HTMLElement = HTMLInputElement,
  TValue = string,
  TChangeEvent = React.ChangeEvent<TElement>,
  TBlurEvent = React.FocusEvent<TElement>,
  TExtendsProps = object,
> = Omit<TExtendsProps, 'name'> & {
  /**
   * The name of the input
   * The name informed will be the key of object returned onSubmit event
   */
  name: string
  /**
   * The React input ref
   */
  ref?: TIsControlled extends true ? undefined : React.Ref<TElement>
  /**
   * The input onChange event, the event informed will be composed with the react-hook-form event
   */
  onChange?: (e: TChangeEvent) => void

  value?: TValue
  /**
   * The input onBlur event, the event informed will be composed with the react-hook-form event
   */
  onBlur?: (e: TBlurEvent) => void
  /**
   * The label of the input, if not informed the label will be empty
   */
  label?: string
}

export type IInputProps<TValue = string> = IFormControlCommonProps<
  false,
  HTMLInputElement,
  TValue,
  React.ChangeEvent<HTMLInputElement>,
  React.FocusEvent<HTMLInputElement, Element>,
  React.InputHTMLAttributes<HTMLInputElement>
>
