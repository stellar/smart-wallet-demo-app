import { fireEvent, render, screen } from 'src/helpers/tests'

import { Select } from '.'

const SELECT_NAME = 'select-test'
const SELECT_OPTIONS = [
  { textValue: 'Business', value: 'Business' },
  { textValue: 'Design', value: 'Design' },
]

describe('Atom Select', () => {
  it('Should render a Select component', () => {
    const view = render(<Select options={SELECT_OPTIONS} name={SELECT_NAME} />)
    const selectVisual = screen.getByRole('combobox')

    expect(selectVisual).toBeInTheDocument()

    const selectNative = view.baseElement.querySelector('select')
    expect(selectNative).toBeInTheDocument()
    expect(selectNative).toHaveAttribute('name', SELECT_NAME)
  })

  it('should render options', async () => {
    render(<Select name={SELECT_NAME} options={SELECT_OPTIONS} />)
    const optionSelect = screen.getByRole('combobox')
    expect(optionSelect).toBeInTheDocument()
    fireEvent.click(optionSelect)

    SELECT_OPTIONS.forEach(option => {
      expect(screen.getByRole('option', { name: option.textValue })).toBeInTheDocument()
    })
  })
})
