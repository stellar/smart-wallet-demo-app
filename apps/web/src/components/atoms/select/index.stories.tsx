import { Meta, StoryFn } from '@storybook/react'

import { ISelectProps, Select } from '.'

export default {
  title: 'Atoms/Select',
  component: Select,
} as Meta

const Template: StoryFn<ISelectProps> = args => <Select {...args} />

export const Default = Template.bind({})

Default.args = {
  options: [
    { textValue: 'Carrot', value: 'Carrot' },
    { textValue: 'Potato', value: 'Potato' },
    { textValue: 'Onion', value: 'Onion' },
    { textValue: 'Tomato', value: 'Tomato' },
  ],
  placeholder: 'Placeholder',
  name: 'Vegetables',
} satisfies ISelectProps
