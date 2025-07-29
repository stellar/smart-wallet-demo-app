import { render, screen, fireEvent } from 'src/helpers/tests'

import { Modal, ModalProps } from '.'

describe('Modal', () => {
  const defaultProps: Required<Pick<ModalProps, 'title' | 'description' | 'button' | 'onClose'>> = {
    title: {
      text: 'Test Modal Title',
      image: {
        source: 'https://example.com/image.jpg',
        variant: 'md',
      },
    },
    description: 'This is a test modal description.',
    button: {
      children: 'Confirm',
      onClick: vi.fn(),
      variant: 'primary',
      size: 'sm',
    },
    onClose: vi.fn(),
  }

  const renderModal = (props?: Partial<ModalProps>) => render(<Modal {...defaultProps} {...props} />)

  it('renders title, description and button', () => {
    renderModal()

    expect(screen.getByText(defaultProps.title.text)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByAltText('Modal image')).toHaveAttribute('src', defaultProps.title.image?.source)
  })

  it('calls onClose when close button is clicked', () => {
    renderModal()

    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking outside modal', () => {
    renderModal()

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.mouseDown(backdrop) // fallback for Safari compatibility
    fireEvent.click(backdrop)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when pressing Escape key', () => {
    renderModal()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders blank-space image if image.source is "blank-space"', () => {
    renderModal({
      title: {
        text: 'Title',
        image: {
          source: 'blank-space',
          variant: 'sm',
        },
      },
    })

    const blankDiv = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'div' && element.className.includes('h-[80px]')
    })

    expect(blankDiv).toBeInTheDocument()
  })

  it('renders transaction variant with transaction data', () => {
    const transaction = {
      hash: 'test-hash-123',
      type: 'CREDIT' as const,
      vendor: 'Test Vendor',
      amount: '1000',
      asset: 'XLM',
      date: '2025-01-15T10:30:00Z',
    }

    renderModal({
      variant: 'transaction',
      transaction,
      onClose: vi.fn(),
    })

    // Check that transaction-specific content is rendered
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
    expect(screen.getByText('1,000 XLM')).toBeInTheDocument()
    expect(screen.getByText('Transaction ID')).toBeInTheDocument()
    expect(screen.getByText('test-hash-123')).toBeInTheDocument()
  })
})
