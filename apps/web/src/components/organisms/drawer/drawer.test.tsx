import { render, screen, fireEvent } from 'src/helpers/tests'

import Drawer from './'

describe('<Drawer />', () => {
  let onClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onClose = vi.fn()
  })

  it('should not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    expect(screen.queryByText('Content')).toBeNull()
  })

  it('should render children when open', () => {
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should call onClose when clicking backdrop', () => {
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )

    fireEvent.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should not call onClose when clicking inside drawer', () => {
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Inside</p>
      </Drawer>
    )
    fireEvent.click(screen.getByText('Inside'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should close on ESC key press', () => {
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should not close on ESC when locked', () => {
    render(
      <Drawer isOpen={true} isLocked onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should show close button if hasCloseButton=true', () => {
    render(
      <Drawer isOpen={true} hasCloseButton onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    expect(screen.getByTestId('navigate-button')).toBeInTheDocument()
  })

  it('should call onClose when clicking close button', () => {
    render(
      <Drawer isOpen={true} hasCloseButton onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    fireEvent.click(screen.getByTestId('navigate-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should not call onClose when clicking close button if locked', () => {
    render(
      <Drawer isOpen={true} hasCloseButton isLocked onClose={onClose}>
        <p>Content</p>
      </Drawer>
    )
    fireEvent.click(screen.getByTestId('navigate-button'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
