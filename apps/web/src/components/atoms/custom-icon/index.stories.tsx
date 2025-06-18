import { Meta, StoryFn } from '@storybook/react'

import { CustomIcon, CustomIconNames, ICustomIconProps } from '.'

export default {
  title: 'Atoms/CustomIcon',
  component: CustomIcon,
} as Meta

const Template: StoryFn<ICustomIconProps> = args => <CustomIcon {...args} />

export const Default = Template.bind({})

Default.argTypes = {
  name: {
    defaultValue: CustomIconNames.user,
    control: {
      type: 'select',
      options: CustomIconNames,
    },
  },
  size: {
    defaultValue: '50px',
  },
}
