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

  it('renders children when provided', () => {
    const testContent = 'Custom modal content'
    renderModal({ children: <div>{testContent}</div> })

    expect(screen.getByText(testContent)).toBeInTheDocument()
    // Should not render default content when children is provided
    expect(screen.queryByText(defaultProps.title.text)).not.toBeInTheDocument()
    expect(screen.queryByText(defaultProps.description)).not.toBeInTheDocument()
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

    const blankDiv = screen.getByTestId('modal-backdrop').querySelector('.h-\\[80px\\]')
    expect(blankDiv).toBeInTheDocument()
  })

  it('renders with background image when backgroundImageUri is provided', () => {
    const backgroundUri = 'https://example.com/background.jpg'
    renderModal({ backgroundImageUri: backgroundUri })

    const modalContainer = screen.getByTestId('modal-backdrop').querySelector('.max-w-md')
    expect(modalContainer).toHaveStyle({
      backgroundImage: `url(${backgroundUri})`,
      backgroundSize: 'cover',
      backgroundPosition: 'top',
    })
  })
})
