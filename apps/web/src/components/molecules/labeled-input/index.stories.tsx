import { Meta, StoryFn } from '@storybook/react'

import { InputText } from 'src/components/atoms'

import { ILabeledInputProps, LabeledInput } from '.'

export default {
  title: 'Molecules/Labeled Input',
  component: LabeledInput,
} as Meta

const Template: StoryFn<ILabeledInputProps> = args => <LabeledInput {...args} input={<InputText name="name" />} />

export const Default = Template.bind({})
Default.args = {
  label: 'Name',
}
