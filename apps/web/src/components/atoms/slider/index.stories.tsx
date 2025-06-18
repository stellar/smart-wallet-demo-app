import { Meta, StoryFn } from '@storybook/react'

import { THEME_STYLES } from 'src/config/theme/theme'

import { ISliderProps, Slider } from '.'

export default {
  title: 'Atoms/Slider',
  component: Slider,
} as Meta

const SLIDER_COLORS = Object.keys(THEME_STYLES.theme.extend.colors)

const Template: StoryFn<ISliderProps> = ({ ...args }) => <Slider {...args} />

export const Default = Template.bind({})
Default.args = {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  trackColor: 'primary',
  rangeColor: 'secondary',
  thumbColor: 'blackish',
  onValueChange: () => {
    return
  },
  onValueCommit: () => {
    return
  },
}
Default.argTypes = {
  step: { description: 'The stepping interval.' },
  min: { description: 'The minimum value for the range.' },
  max: { description: 'The maximum value for the range.' },
  value: {
    description: 'The controlled value of the slider. Must be used in conjunction with onValueChange.',
  },
  disabled: {
    description: 'When true, prevents the user from interacting with the slider.',
  },
  trackColor: {
    description: 'Track color',
    control: 'select',
    options: SLIDER_COLORS,
  },
  rangeColor: {
    description: 'Range color',
    control: 'select',
    options: SLIDER_COLORS,
  },
  thumbColor: {
    description: 'Thumb color',
    control: 'select',
    options: SLIDER_COLORS,
  },
  onValueChange: {
    description: 'Event handler called when the value changes.',
  },
  onValueCommit: {
    description: 'Event handler called when the value changes at the end of an interaction. ',
  },
}
