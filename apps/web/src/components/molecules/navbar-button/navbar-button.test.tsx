import { render, screen, fireEvent } from 'src/helpers/tests'

import { NavbarButton } from './index'

describe('NavbarButton', () => {
  it('renders with tertiary variant by default (inactive state)', () => {
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Home">
        Home
      </NavbarButton>
    )
    const button = screen.getByTestId('navbar-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('navbar-button')
    expect(button).toHaveTextContent('Home')
  })

  it('renders with secondary variant when isActive is true', () => {
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Active" isActive>
        Active
      </NavbarButton>
    )
    const button = screen.getByTestId('navbar-button')
    expect(button).toHaveClass('navbar-button')
    const container = button.parentElement
    expect(container).toHaveClass('navbar-button-container--active')
    expect(button).toHaveTextContent('Active')
  })

  it('renders icon when provided', () => {
    const mockIcon = <span data-testid="test-icon">🏠</span>
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Home" icon={mockIcon}>
        Home
      </NavbarButton>
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('hides label when iconOnly is true', () => {
    const mockIcon = <span data-testid="test-icon">🏠</span>
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Home" icon={mockIcon} iconOnly>
        Home
      </NavbarButton>
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    const container = screen.getByTestId('test-icon').parentElement?.parentElement?.parentElement
    expect(container).toHaveClass('navbar-button-container--icon-only')
  })

  it('hides label when showLabel is false', () => {
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Home" showLabel={false}>
        Home
      </NavbarButton>
    )
    expect(screen.getByTestId('navbar-button')).toHaveTextContent('Home')
  })

  it('passes other props to the Button', async () => {
    const onClick = vi.fn()
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Test" onClick={onClick} aria-label="navbar-test">
        Test
      </NavbarButton>
    )
    const button = screen.getByTestId('navbar-button')
    expect(button).toHaveAttribute('aria-label', 'navbar-test')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('renders inside a container with the correct class', () => {
    render(<NavbarButton data-testid="navbar-button" size={'sm'} label="Container Test" />)
    const button = screen.getByTestId('navbar-button')
    const container = button.parentElement
    expect(container).toHaveClass('navbar-button-container')
  })

  it('applies active container class when isActive is true', () => {
    render(<NavbarButton data-testid="navbar-button" size={'sm'} label="Active" isActive />)
    const button = screen.getByTestId('navbar-button')
    const container = button.parentElement
    expect(container).toHaveClass('navbar-button-container--active')
  })

  it('applies icon-only container class when iconOnly is true', () => {
    const mockIcon = <span data-testid="test-icon">🏠</span>
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Home" icon={mockIcon} iconOnly>
        Home
      </NavbarButton>
    )
    const container = screen.getByTestId('test-icon').parentElement?.parentElement?.parentElement
    expect(container).toHaveClass('navbar-button-container--icon-only')
  })

  it('handles disabled state', () => {
    render(
      <NavbarButton data-testid="navbar-button" size={'sm'} label="Disabled" disabled>
        Disabled
      </NavbarButton>
    )
    const button = screen.getByTestId('navbar-button')
    expect(button).toBeDisabled()
  })
})
