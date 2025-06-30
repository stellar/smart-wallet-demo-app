import { render, screen } from 'src/helpers/tests'

import { ISliderProps, Slider } from '.'

const renderComponent = (props?: ISliderProps) => render(<Slider {...props} />)

describe('Slider component', () => {
  it('should render component', () => {
    renderComponent()

    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })
})
