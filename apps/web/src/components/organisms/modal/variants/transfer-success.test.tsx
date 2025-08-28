import { render, screen, fireEvent } from 'src/helpers/tests'

import { ModalTransferSuccess, ModalTransferSuccessProps } from './transfer-success'

describe('ModalTransferSuccess', () => {
  const defaultProps: ModalTransferSuccessProps = {
    variant: 'transfer-success',
    title: 'Transfer Complete!',
    message: 'Your NFTs have been sent!',
    button: {
      children: 'Go to Home',
      onClick: vi.fn(),
      variant: 'secondary',
      size: 'xl',
    },
  }

  it('renders success title correctly', () => {
    render(<ModalTransferSuccess {...defaultProps} />)
    expect(screen.getByText('Transfer Complete!')).toBeInTheDocument()
  })

  it('renders success message correctly', () => {
    render(<ModalTransferSuccess {...defaultProps} />)
    expect(screen.getByText('Your NFTs have been sent!')).toBeInTheDocument()
  })

  it('renders custom title and message', () => {
    const customProps = {
      ...defaultProps,
      title: 'Custom Title',
      message: 'Custom Message',
    }
    render(<ModalTransferSuccess {...customProps} />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Message')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(<ModalTransferSuccess {...defaultProps} />)
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument()
  })

  it('does not render action button when not provided', () => {
    const { ...propsWithoutButton } = defaultProps
    render(<ModalTransferSuccess {...propsWithoutButton} />)
    expect(screen.queryByRole('button', { name: /go to home/i })).not.toBeInTheDocument()
  })

  it('calls button onClick when action button is clicked', () => {
    const mockOnClick = vi.fn()
    const propsWithMock = {
      ...defaultProps,
      button: {
        ...defaultProps.button,
        onClick: mockOnClick,
        variant: 'secondary' as const,
        size: 'xl' as const,
      },
    }

    render(<ModalTransferSuccess {...propsWithMock} />)
    const button = screen.getByRole('button', { name: /go to home/i })
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('displays success icon', () => {
    render(<ModalTransferSuccess {...defaultProps} />)
    const successIcon = document.querySelector('.w-16.h-16.bg-green-500')
    expect(successIcon).toBeInTheDocument()
  })
})
