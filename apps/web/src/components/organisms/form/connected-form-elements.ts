import * as React from 'react'

import { InputCheckbox, InputRadio, InputText, Select } from 'src/components/atoms'
import { IInputProps } from 'src/components/types/input'

import { IControlledFormElements, IFormElements, IUncontrolledFormElements } from './types'

// Add Here every form component to expose in form elements

const CONTROLLED_FORM_ELEMENTS: IControlledFormElements = {
  Select,
}

const UNCONTROLLED_FORM_ELEMENTS: IUncontrolledFormElements = {
  InputText,
  InputRadio,
  InputCheckbox,
}

export const FORM_ELEMENT_MAP: IFormElements = {
  ...UNCONTROLLED_FORM_ELEMENTS,
  ...CONTROLLED_FORM_ELEMENTS,
}

export const isFormComponent = (
  component: React.ReactElement<IInputProps | unknown> | React.ReactNode
): string | false =>
  Object.values(FORM_ELEMENT_MAP).some(el => el === (component as React.ReactElement).type) &&
  (component as React.ReactElement)?.props?.name

export const isControlledComponent = (component: React.ReactElement<IInputProps | unknown>): boolean =>
  Object.values(CONTROLLED_FORM_ELEMENTS).some(el => el === (component as React.ReactElement)?.type)
