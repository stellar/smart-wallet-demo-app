import { render, screen, fireEvent } from 'src/helpers/tests'

import { ImageCard } from '.'

const defaultProps = {
  imageUri: 'https://example.com/image.png',
}

describe('ImageCard', () => {
  it('renders without crashing (default: md)', () => {
    render(<ImageCard {...defaultProps} />)
    const wrapper = screen.getByRole('button')
    expect(wrapper).toHaveClass('w-[220px]')
    expect(wrapper).toHaveClass('h-[224px]')
  })

  it('renders with size lg', () => {
    render(<ImageCard {...defaultProps} size="lg" />)
    const wrapper = screen.getByRole('button')
    expect(wrapper).toHaveClass('w-[262px]')
    expect(wrapper).toHaveClass('h-[266px]')
  })

  it('renders with size sm', () => {
    render(<ImageCard {...defaultProps} size="sm" />)
    const wrapper = screen.getByRole('button')
    expect(wrapper).toHaveClass('w-[179px]')
    expect(wrapper).toHaveClass('h-[182px]')
  })

  it('renders name and image when name is provided', () => {
    render(<ImageCard {...defaultProps} name="Sample Card" />)
    expect(screen.getByText('Sample Card')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', defaultProps.imageUri)
  })

  it('renders background image when name is not provided', () => {
    render(<ImageCard {...defaultProps} />)
    const wrapper = screen.getByRole('button')
    expect(wrapper).toHaveStyle(`background-image: url(${defaultProps.imageUri})`)
  })

  it('renders leftBadge with success variant', () => {
    render(<ImageCard {...defaultProps} leftBadge={{ label: 'Left', variant: 'success' }} />)
    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('renders rightBadge with disabled variant', () => {
    render(<ImageCard {...defaultProps} rightBadge={{ label: 'Right', variant: 'disabled' }} />)
    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('calls onClick when clicked if clickable', () => {
    const handleClick = vi.fn()
    render(<ImageCard {...defaultProps} onClick={handleClick} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })

  it('renders as div when not clickable', () => {
    render(<ImageCard {...defaultProps} isClickable={false} />)
    const button = screen.queryByRole('button')
    expect(button).not.toBeInTheDocument()
    const div = screen.getByText((_, element) => element?.id === 'image-card-wrapper')
    expect(div).toBeInTheDocument()
  })

  it('does not render checkbox when isSelectable is false (default)', () => {
    render(<ImageCard {...defaultProps} />)
    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  it('does not render checkbox when isSelectable is false even with isSelected', () => {
    render(<ImageCard {...defaultProps} isSelectable={false} isSelected={true} />)
    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  it('renders unchecked checkbox when isSelectable is true and isSelected is false', () => {
    render(<ImageCard {...defaultProps} isSelectable={true} isSelected={false} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked checkbox when isSelectable is true and isSelected is true', () => {
    render(<ImageCard {...defaultProps} isSelectable={true} isSelected={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()
  })

  it('calls onClick when checkbox is clicked', () => {
    const handleClick = vi.fn()
    render(<ImageCard {...defaultProps} isSelectable={true} isSelected={false} onClick={handleClick} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(handleClick).toHaveBeenCalled()
  })
})
