import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from 'src/helpers/tests'
import { NavigateButton } from './index'

// Mock @stellar/design-system
vi.mock('@stellar/design-system', () => ({
  Icon: {
    ArrowRight: (props: Record<string, unknown>) => <svg data-testid="arrow-right" {...props} />,
    ArrowLeft: (props: Record<string, unknown>) => <svg data-testid="arrow-left" {...props} />,
    XClose: (props: Record<string, unknown>) => <svg data-testid="x-close" {...props} />,
  },
  Button: (props: Record<string, unknown>) => <button {...props} />,
}))

describe('NavigateButton', () => {
  it('renders ArrowLeft icon by default', () => {
    render(<NavigateButton />)
    expect(screen.getByTestId('arrow-left')).toBeInTheDocument()
  })

  it('renders ArrowRight icon when type="next"', () => {
    render(<NavigateButton type="next" />)
    expect(screen.getByTestId('arrow-right')).toBeInTheDocument()
  })

  it('renders XClose icon when type="close"', () => {
    render(<NavigateButton type="close" />)
    expect(screen.getByTestId('x-close')).toBeInTheDocument()
  })

  it('uses small icon size by default', () => {
    render(<NavigateButton />)
    const icon = screen.getByTestId('arrow-left')
    expect(icon).toHaveAttribute('width', '12')
    expect(icon).toHaveAttribute('height', '12')
  })

  it('uses medium icon size when size="md"', () => {
    render(<NavigateButton type="next" size="md" />)
    const icon = screen.getByTestId('arrow-right')
    expect(icon).toHaveAttribute('width', '14')
    expect(icon).toHaveAttribute('height', '14')
  })

  it('applies correct style for small size', () => {
    render(<NavigateButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      width: '28px',
      height: '28px',
      paddingTop: '4px',
      paddingBottom: '4px',
      paddingLeft: '8px',
      paddingRight: '8px',
      borderRadius: '50%',
    })
  })

  it('applies correct style for md size', () => {
    render(<NavigateButton size="md" />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      width: '34px',
      height: '34px',
      paddingTop: '6px',
      paddingBottom: '6px',
      paddingLeft: '10px',
      paddingRight: '10px',
      borderRadius: '50%',
    })
  })

  it('calls onClick when button is clicked', () => {
    const handleClick = vi.fn()
    render(<NavigateButton onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
