import { Meta, StoryFn } from '@storybook/react'

import { IInputCheckboxProps, InputCheckbox } from '.'

export default {
  title: 'Atoms/Input Checbox',
  component: InputCheckbox,
} as Meta

const Template: StoryFn<IInputCheckboxProps> = args => <InputCheckbox {...args} />

export const Default = Template.bind({})

Default.args = {
  children: <span>Click me</span>,
  checked: false,
  name: 'name',
  ref: null,
} satisfies IInputCheckboxProps
