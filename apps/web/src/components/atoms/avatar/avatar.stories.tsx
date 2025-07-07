import type { Meta, StoryObj } from '@storybook/react'

import BlackLogo from 'src/assets/black-logo.svg'

import { Avatar } from '.'

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    img: {
      control: 'text',
      description: 'URL or path to the avatar image',
    },
    name: {
      control: 'text',
      description: 'User name to generate initials from',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    img: BlackLogo,
  },
}

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
}

export const CustomStyling: Story = {
  args: {
    name: 'John Doe',
    className: 'bg-blue-500 size-16',
  },
}

export const Variants = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar name="Small User" className="size-8" />
      <Avatar name="Default User" />
      <Avatar name="Large User" className="size-12" />
      <Avatar name="XL User" className="size-16" />
    </div>
  ),
}

export const StyleVariants = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar name="John Doe" className="bg-primary text-white" />
      <Avatar name="Jane Smith" className="bg-secondary" />
      <Avatar name="Bob Johnson" className="bg-accent" />
      <Avatar name="Alice Brown" className="bg-gray-200" />
    </div>
  ),
}
