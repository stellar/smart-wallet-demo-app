/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import { DefaultValues, FieldValues, Resolver, useForm as useReactHookForm } from 'react-hook-form'

import { FORM_ELEMENT_MAP, isControlledComponent, isFormComponent } from './connected-form-elements'
import { renderFormElementWithLabel } from './helpers'
import { FormProps, IFormProps, IUseFormReturn } from './types'

const useForm = <T extends FieldValues>({ validationSchema, initialValues }: IFormProps<T> = {}): IUseFormReturn<
  T,
  any,
  any
> => {
  const formAPI = useReactHookForm<T, any, any>({
    defaultValues: initialValues as DefaultValues<T>,
    resolver: validationSchema ? (yupResolver(validationSchema) as unknown as Resolver<T>) : undefined,
  })

  const {
    register,
    control,
    formState: { errors },
  } = formAPI

  const Form = React.useMemo(() => {
    const renderFormElements = (elements: React.ReactElement | React.ReactNode): React.ReactElement | React.ReactNode =>
      React.Children.toArray(elements).map(child => {
        if (React.isValidElement(child)) {
          if (isFormComponent(child)) {
            const formActions = { errors, register }
            if (isControlledComponent(child)) {
              return renderFormElementWithLabel<T>(child, {
                ...formActions,
                control,
              })
            }
            return renderFormElementWithLabel(child, formActions)
          }
          if (React.Children.toArray(child.props.children).length) {
            return React.cloneElement(child, child.props, renderFormElements(child.props.children))
          }
        }
        return child
      })
    const FormComponent: React.FC<FormProps> = ({ children, ...rest }) => (
      <form data-testid="form" {...rest}>
        {renderFormElements(children)}
      </form>
    )
    return Object.assign(FormComponent, FORM_ELEMENT_MAP)
  }, [control, errors, register])

  return { Form, ...formAPI }
}

export { useForm }
