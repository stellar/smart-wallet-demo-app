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
})
