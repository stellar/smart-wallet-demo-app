import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'

import Logo from 'src/assets/logo.svg'

import { Avatar } from '.'

describe('Avatar Component', () => {
  it('renders correctly with default logo', () => {
    render(<Avatar img={Logo} />)

    const root = screen.getByRole('presentation')
    expect(root).toHaveClass('rounded-full', 'bg-secondary', 'size-10')
  })

  it('renders correctly with only name', () => {
    render(<Avatar name="John Doe" />)

    const initials = screen.getByText('JD')
    expect(initials).toBeInTheDocument()

    const root = screen.getByRole('presentation')
    expect(root).toHaveClass('rounded-full', 'bg-secondary', 'size-10')
  })

  it('renders both logo and initials when both props are provided', () => {
    render(<Avatar img={Logo} name="John Doe" />)

    const initials = screen.getByText('JD')
    expect(initials).toBeInTheDocument()

    const root = screen.getByRole('presentation')
    expect(root).toHaveClass('rounded-full', 'bg-secondary', 'size-10')
  })

  it('generates correct initials for different name formats', () => {
    const testCases = [
      { name: 'John', expected: 'J' },
      { name: 'John Doe', expected: 'JD' },
      { name: 'John Middle Doe', expected: 'JMD' },
    ]

    testCases.forEach(({ name, expected }) => {
      const { unmount } = render(<Avatar name={name} />)
      const initials = screen.getByText(expected)
      expect(initials).toBeInTheDocument()
      unmount()
    })
  })

  it('applies custom className correctly', () => {
    render(<Avatar img={Logo} className="custom-test-class" />)

    const root = screen.getByRole('presentation')
    expect(root).toHaveClass('custom-test-class')
    expect(root).toHaveClass('rounded-full')
    expect(root).toHaveClass('bg-secondary')
    expect(root).toHaveClass('size-10')
  })

  it('maintains proper structure and styling', () => {
    render(<Avatar img={Logo} name="John Doe" className="test-class" />)

    const root = screen.getByRole('presentation')
    expect(root).toHaveClass('test-class')
    expect(root).toHaveClass('rounded-full')
    expect(root).toHaveClass('bg-secondary')
  })
})
