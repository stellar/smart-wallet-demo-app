import { render, screen, fireEvent, waitFor } from 'src/helpers/tests'
import { Collapse, CollapseItem } from '.'

describe('CollapseItem', () => {
  it('renders title and children (collapsed by default)', () => {
    render(
      <CollapseItem title="Item 1">
        <div>Content 1</div>
      </CollapseItem>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 1')).toBeInTheDocument()

    // The content should be hidden (height = 0px)
    const contentDiv = screen.getByText('Content 1').parentElement?.parentElement
    expect(contentDiv).toHaveStyle('height: 0px')
  })

  it('expands on click', () => {
    render(
      <CollapseItem title="Item 2">
        <div>Content 2</div>
      </CollapseItem>
    )

    const button = screen.getByRole('button', { name: /item 2/i })
    fireEvent.click(button)

    waitFor(() => {
      const contentDiv = screen.getByText('Content 2').parentElement?.parentElement
      expect(contentDiv).not.toHaveStyle('height: 0px')
    })
  })

  it('starts expanded when defaultOpen is true', () => {
    render(
      <CollapseItem title="Item 3" defaultOpen>
        <div>Content 3</div>
      </CollapseItem>
    )

    waitFor(() => {
      const contentDiv = screen.getByText('Content 3').parentElement?.parentElement
      expect(contentDiv).not.toHaveStyle('height: 0px')
    })
  })
})

describe('Collapse', () => {
  it('renders title and children items', () => {
    render(
      <Collapse title="FAQ">
        <CollapseItem title="Q1">
          <div>A1</div>
        </CollapseItem>
      </Collapse>
    )

    expect(screen.getByText('FAQ')).toBeInTheDocument()
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()
  })

  it('renders multiple CollapseItem children', () => {
    render(
      <Collapse title="FAQ">
        <CollapseItem title="Q1">
          <div>A1</div>
        </CollapseItem>
        <CollapseItem title="Q2">
          <div>A2</div>
        </CollapseItem>
      </Collapse>
    )

    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
  })

  it('throws error for invalid children', () => {
    const InvalidChild = () => <div>Invalid</div>

    expect(() =>
      render(
        <Collapse title="Invalid">
          <InvalidChild />
        </Collapse>
      )
    ).toThrowError('Collapse only accepts children of type <CollapseItem />')
  })
})
