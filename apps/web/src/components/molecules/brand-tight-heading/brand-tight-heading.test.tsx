import { render, screen } from 'src/helpers/tests'
import { BrandTightHeading } from './index'

describe('BrandTightHeading', () => {
  it('renders all lines', () => {
    const lines = ['First line', 'Second line', 'Third line']
    render(<BrandTightHeading testId="typography" lines={lines} />)
    lines.forEach(line => {
      expect(screen.getByText(line)).toBeInTheDocument()
    })
  })

  it('applies the className to Typography', () => {
    render(<BrandTightHeading testId="typography" lines={['Line']} className="custom-class" />)
    const typography = screen.getByTestId('typography')
    expect(typography).toHaveClass('custom-class')
  })

  it('applies -mb-3 to all but the last line', () => {
    const lines = ['A', 'B', 'C']
    render(<BrandTightHeading testId="typography" lines={lines} />)
    const divs = screen.getAllByText(/A|B|C/)
    expect(divs[0]).toHaveClass('-mb-3')
    expect(divs[1]).toHaveClass('-mb-3')
    expect(divs[2]).not.toHaveClass('-mb-3')
  })

  it('renders nothing if lines is empty', () => {
    render(<BrandTightHeading testId="typography" lines={[]} />)
    // Typography will still render, but no children divs
    const typography = screen.getByTestId('typography')
    expect(typography).toBeInTheDocument()
    expect(typography.childElementCount).toBe(0)
  })
})
