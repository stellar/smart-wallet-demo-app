import { Meta, StoryFn } from '@storybook/react'
import Logo from 'src/assets/logo.svg?react'

import { Button, ButtonIconPosition, ButtonSize, ButtonVariant, IButtonProps } from '.'
import { CustomIcon, CustomIconNames } from '../custom-icon'

export default {
  title: 'Atoms/Button',
  component: Button,
} as Meta

const Template: StoryFn<IButtonProps> = ({ icon, ...args }: IButtonProps) => (
  <Button {...args} icon={icon && <CustomIcon name={icon as CustomIconNames} />} />
)

export const Default = Template.bind({})
Default.args = {
  label: 'Click me',
  variant: ButtonVariant.primary,
  size: ButtonSize.medium,
  iconPosition: ButtonIconPosition.left,
}
Default.argTypes = {
  variant: {
    description: 'Button variant',
    control: 'select',
    options: Object.values(ButtonVariant),
  },
  size: {
    description: 'Button size',
    control: 'select',
    options: Object.values(ButtonSize),
  },
  onClick: { table: { disable: true } },
  icon: { control: 'select', options: Object.values(CustomIconNames) },
  iconPosition: {
    control: 'select',
    options: Object.values(ButtonIconPosition),
  },
}

const ButtonWithIconTemplate: StoryFn<IButtonProps> = args => <Button {...args} icon={<Logo />} />
export const ButtonWithIcon = ButtonWithIconTemplate.bind({})
ButtonWithIcon.args = {
  label: 'Click me',
  variant: ButtonVariant.primary,
  size: ButtonSize.large,
}
