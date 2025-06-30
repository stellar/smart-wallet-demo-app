import * as React from 'react'
import { ChangeEvent, FocusEvent, HTMLProps, PropsWithChildren } from 'react'

import { DeepPartial, FieldValues, UseFormReturn as UseReactHookFormReturn } from 'react-hook-form'
import * as Yup from 'yup'

import { IInputCheckboxProps, IInputRadioProps, IInputTextProps, ISelectProps } from 'src/components/atoms'
import { IFormControlCommonProps } from 'src/components/types/input'

export interface IFormProps<T extends FieldValues = FieldValues> {
  initialValues?: DeepPartial<T>
  validationSchema?: Yup.ObjectSchema<T>
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
}

export interface IFormInputProps extends IFormControlCommonProps {
  /**
   * The labeledInput Container className
   */
  labeledInputClassName?: string
}

export type UpdateFormEvent = ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>

export type IConnectedUncontrolledFormElementProps<TComponentProps> = React.FC<
  Omit<IFormInputProps & TComponentProps, 'ref'>
>
export type IConnectedControlledFormElementProps<TComponentProps> = React.FC<
  Omit<IFormInputProps & TComponentProps, 'ref' | 'onChange'>
>

export interface IControlledFormElements {
  Select: IConnectedControlledFormElementProps<ISelectProps>
}

export interface IUncontrolledFormElements {
  InputText: IConnectedUncontrolledFormElementProps<IInputTextProps>
  InputCheckbox: IConnectedUncontrolledFormElementProps<IInputCheckboxProps>
  InputRadio: IConnectedUncontrolledFormElementProps<IInputRadioProps>
}

export interface IFormElements extends IControlledFormElements, IUncontrolledFormElements {}

export type FormProps = PropsWithChildren & HTMLProps<HTMLFormElement>

export type FormType = React.FC<FormProps> & IFormElements

export interface IUseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> extends UseReactHookFormReturn<TFieldValues, TContext, TTransformedValues> {
  Form: FormType
}
