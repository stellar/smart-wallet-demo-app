import { Meta, StoryFn } from '@storybook/react'
import { FC } from 'react'
import * as yup from 'yup'

import { IFormProps } from './types'

import { useForm } from '.'

const FormDemo: FC<IFormProps> = args => {
  const validationSchema = yup.object().shape({
    name: yup.string().required(),
  })
  const { Form } = useForm({ ...args, validationSchema })
  return (
    <Form>
      <Form.InputText name="name" label="Name" />
      <Form.Select
        name="city"
        label="City"
        options={[
          {
            textValue: 'Florianópolis',
            value: 'floripa',
          },
        ]}
      />
      <Form.InputRadio name="radio">Radio</Form.InputRadio>
      <Form.InputCheckbox name="checkbox">Checkbox</Form.InputCheckbox>
      <hr />
      <input type="submit" value="Submit" />
    </Form>
  )
}

export default {
  title: 'Organisms/Form',
  component: FormDemo,
} as Meta

const Template: StoryFn<IFormProps> = (args: IFormProps) => <FormDemo {...args} />

export const Default = Template.bind({})
Default.args = {}
