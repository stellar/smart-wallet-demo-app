import { render, screen } from 'src/helpers/tests'

import { Carousel } from './index'

describe('Carousel', () => {
  it('renders children correctly', () => {
    render(
      <Carousel>
        <div>Item 1</div>
        <div>Item 2</div>
      </Carousel>
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Carousel title="Test Title">
        <div>Item</div>
      </Carousel>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Carousel className="custom-class">
        <div>Item</div>
      </Carousel>
    )
    const scrollDiv = container.querySelector('.custom-class')
    expect(scrollDiv).toBeTruthy()
  })

  it('wraps single child in snap-center div', () => {
    const { container } = render(
      <Carousel>
        <div>Single Item</div>
      </Carousel>
    )
    const snapDivs = container.querySelectorAll('.snap-center')
    expect(snapDivs.length).toBe(1)
    expect(screen.getByText('Single Item')).toBeInTheDocument()
  })

  it('wraps multiple children in snap-center divs', () => {
    const { container } = render(
      <Carousel>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Carousel>
    )
    const snapDivs = container.querySelectorAll('.snap-center')
    expect(snapDivs.length).toBe(3)
  })
})
