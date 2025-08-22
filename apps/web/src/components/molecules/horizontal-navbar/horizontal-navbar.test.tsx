import { render, screen, fireEvent } from 'src/helpers/tests'

import { HorizontalNavbar, HorizontalNavbarItem } from './index'

const mockItems: HorizontalNavbarItem[] = [
  {
    id: 'item1',
    label: 'Transfer XLM',
    onClick: vi.fn(),
  },
  {
    id: 'item2',
    label: 'Transfer NFTs',
    onClick: vi.fn(),
  },
  {
    id: 'item3',
    label: 'History',
    onClick: vi.fn(),
    disabled: true,
  },
]

const mockItemsWithIcons: HorizontalNavbarItem[] = [
  {
    id: 'item1',
    label: 'Transfer XLM',
    icon: <span data-testid="icon-1">💰</span>,
    onClick: vi.fn(),
  },
  {
    id: 'item2',
    label: 'Transfer NFTs',
    icon: <span data-testid="icon-2">🖼️</span>,
    onClick: vi.fn(),
  },
]

describe('HorizontalNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all items with labels', () => {
    render(<HorizontalNavbar items={mockItems} />)

    expect(screen.getByText('Transfer XLM')).toBeInTheDocument()
    expect(screen.getByText('Transfer NFTs')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  it('renders items with correct test ids', () => {
    render(<HorizontalNavbar items={mockItems} />)

    expect(screen.getByTestId('navbar-item-item1')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-item-item2')).toBeInTheDocument()
    expect(screen.getByTestId('navbar-item-item3')).toBeInTheDocument()
  })

  it('handles item clicks correctly', () => {
    render(<HorizontalNavbar items={mockItems} />)

    const item1Button = screen.getByTestId('navbar-item-item1')
    const item2Button = screen.getByTestId('navbar-item-item2')

    fireEvent.click(item1Button)
    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(item2Button)
    expect(mockItems[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick for disabled items', () => {
    render(<HorizontalNavbar items={mockItems} />)

    const disabledButton = screen.getByTestId('navbar-item-item3')
    fireEvent.click(disabledButton)

    expect(mockItems[2].onClick).not.toHaveBeenCalled()
  })

  it('applies active state to the correct item', () => {
    render(<HorizontalNavbar items={mockItems} activeItemId="item2" />)

    const activeButton = screen.getByTestId('navbar-item-item2')
    expect(activeButton).toHaveClass('navbar-button')
    const activeContainer = activeButton.parentElement
    expect(activeContainer).toHaveClass('navbar-button-container--active')

    const inactiveButton = screen.getByTestId('navbar-item-item1')
    expect(inactiveButton).toHaveClass('navbar-button')
    const inactiveContainer = inactiveButton.parentElement
    expect(inactiveContainer).toHaveClass('navbar-button-container')
    expect(inactiveContainer).not.toHaveClass('navbar-button-container--active')
  })

  it('renders icons when provided', () => {
    render(<HorizontalNavbar items={mockItemsWithIcons} />)

    expect(screen.getByTestId('icon-1')).toBeInTheDocument()
    expect(screen.getByTestId('icon-2')).toBeInTheDocument()
  })

  it('hides labels when showLabels is false', () => {
    render(<HorizontalNavbar items={mockItems} showLabels={false} />)

    expect(screen.queryByText('Transfer XLM')).not.toBeInTheDocument()
    expect(screen.queryByText('Transfer NFTs')).not.toBeInTheDocument()
  })

  it('renders in icon-only mode', () => {
    render(<HorizontalNavbar items={mockItemsWithIcons} iconOnly />)

    expect(screen.getByTestId('icon-1')).toBeInTheDocument()
    expect(screen.getByTestId('icon-2')).toBeInTheDocument()
    expect(screen.queryByText('Transfer XLM')).not.toBeInTheDocument()
    expect(screen.queryByText('Transfer NFTs')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<HorizontalNavbar items={mockItems} className="custom-navbar" />)

    const navbar = screen.getByTestId('navbar-item-item1').parentElement?.parentElement
    expect(navbar).toHaveClass('custom-navbar')
    expect(navbar).toHaveClass('horizontal-navbar')
  })

  it('applies custom itemClassName', () => {
    render(<HorizontalNavbar items={mockItems} itemClassName="custom-item" />)

    const button1 = screen.getByTestId('navbar-item-item1')
    const button2 = screen.getByTestId('navbar-item-item2')

    expect(button1).toHaveClass('custom-item')
    expect(button2).toHaveClass('custom-item')
  })

  it('applies custom maxWidth', () => {
    render(<HorizontalNavbar items={mockItems} maxWidth="500px" />)

    const navbar = screen.getByTestId('navbar-item-item1').parentElement?.parentElement
    expect(navbar).toHaveStyle('max-width: 500px')
  })

  it('handles empty items array', () => {
    const { container } = render(<HorizontalNavbar items={[]} />)

    const navbar = container.querySelector('.horizontal-navbar')
    expect(navbar).toBeInTheDocument()
    expect(navbar?.children).toHaveLength(0)
  })

  it('handles items without onClick handlers', () => {
    const itemsWithoutClick: HorizontalNavbarItem[] = [{ id: 'item1', label: 'Static Item' }]

    render(<HorizontalNavbar items={itemsWithoutClick} />)

    const button = screen.getByTestId('navbar-item-item1')
    expect(button).toBeInTheDocument()

    // Should not throw error when clicked
    fireEvent.click(button)
  })
})
