import { Meta, StoryFn } from '@storybook/react'

import { Status } from 'src/constants/enums'

import {
  ITypographyProps,
  Typography,
  TypographyDecoration,
  TypographySize,
  TypographyVariant,
  TypographyWeight,
} from '.'

export default {
  title: 'Atoms/Typography',
  component: Typography,
  argTypes: {
    weight: {
      control: {
        type: 'select',
      },
      options: Object.values(TypographyWeight),
    },
    size: {
      control: {
        type: 'select',
      },
      options: Object.values(TypographySize),
    },
    decoration: {
      control: {
        type: 'radio',
      },
      options: Object.values(TypographyDecoration),
    },
    status: {
      control: {
        type: 'radio',
      },
      options: Object.values(Status),
    },
  },
} as Meta

const Template: StoryFn<ITypographyProps> = (args: ITypographyProps) => <Typography {...args} />

export const Default = Template.bind({})
Default.args = {
  variant: TypographyVariant.h1,
  children: 'Typography Text',
}
