import { render, screen, fireEvent } from 'src/helpers/tests'
import { GhostButton } from './index'

describe('GhostButton', () => {
  it('renders with tertiary variant by default', () => {
    render(
      <GhostButton data-testid="sds-button" size={'sm'}>
        Click me
      </GhostButton>
    )
    const button = screen.getByTestId('sds-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('Button--tertiary')
    expect(button).toHaveTextContent('Click me')
  })

  it('renders with secondary variant when invertColor is true', () => {
    render(
      <GhostButton data-testid="sds-button" size={'sm'} invertColor>
        Invert
      </GhostButton>
    )
    const button = screen.getByTestId('sds-button')
    expect(button).toHaveClass('Button--secondary')
    expect(button).toHaveTextContent('Invert')
  })

  it('passes other props to the Button', async () => {
    const onClick = vi.fn()
    render(
      <GhostButton data-testid="sds-button" size={'sm'} onClick={onClick} aria-label="ghost">
        Test
      </GhostButton>
    )
    const button = screen.getByTestId('sds-button')
    expect(button).toHaveAttribute('aria-label', 'ghost')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('renders inside a container with the correct class', () => {
    render(
      <GhostButton data-testid="sds-button" size={'sm'}>
        Container Test
      </GhostButton>
    )
    const container = screen.getByText('Container Test').parentElement
    expect(container).toHaveClass('ghost-button-container')
  })
})
