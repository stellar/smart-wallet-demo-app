import { Meta, StoryFn } from '@storybook/react'

import { IInputRadioProps, InputRadio } from '.'

export default {
  title: 'Atoms/Input Radio',
  component: InputRadio,
} as Meta

const Template: StoryFn<IInputRadioProps> = args => <InputRadio {...args} />

export const Default = Template.bind({})

Default.args = {
  children: <span>Click me</span>,
  checked: false,
  name: 'name',
  ref: null,
} satisfies IInputRadioProps
