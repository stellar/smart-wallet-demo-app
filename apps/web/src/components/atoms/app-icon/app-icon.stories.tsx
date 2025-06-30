import { Meta, StoryFn } from '@storybook/react'

import { AppIcon, AppIconNames, AppIconProps } from '.'

export default {
  title: 'Atoms/AppIcon',
  component: AppIcon,
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: AppIconNames,
      },
    },
  },
} as Meta<AppIconProps>

const Template: StoryFn<AppIconProps> = args => <AppIcon {...args} />

export const Default = Template.bind({})

Default.args = {
  name: AppIconNames.arrowUp,
}
