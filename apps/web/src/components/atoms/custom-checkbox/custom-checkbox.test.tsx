import '@testing-library/jest-dom'

import { render, screen, fireEvent } from '@testing-library/react'

import { CustomCheckbox } from '.'

describe('CustomCheckbox Component', () => {
  it('renders correctly with default props', () => {
    render(<CustomCheckbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox', 'custom-checkbox--size-md')
  })

  it('renders checked state correctly', () => {
    render(<CustomCheckbox checked={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox--checked')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('renders unchecked state correctly', () => {
    render(<CustomCheckbox checked={false} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toHaveClass('custom-checkbox--checked')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<CustomCheckbox size="sm" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox--size-sm')

    rerender(<CustomCheckbox size="md" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox--size-md')

    rerender(<CustomCheckbox size="lg" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox--size-lg')
  })

  it('applies custom className correctly', () => {
    render(<CustomCheckbox className="custom-class" />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<CustomCheckbox onClick={handleClick} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows clickable styles when onClick is provided', () => {
    render(<CustomCheckbox onClick={() => undefined} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox--clickable')
  })

  it('does not show clickable styles when onClick is not provided', () => {
    render(<CustomCheckbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toHaveClass('custom-checkbox--clickable')
  })
})
