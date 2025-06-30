import { fireEvent } from '@testing-library/react'

import { render, screen } from 'src/helpers/tests'

import { InputText } from '.'

const INPUT_NAME = 'input-test'

describe('Atom InputText', () => {
  it('Should render a InputText component', () => {
    render(<InputText name={INPUT_NAME} />)
    const input = screen.getByRole('textbox')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('name', INPUT_NAME)
  })

  it('should trigger onChange properly when the use types', () => {
    const onChange = vi.fn()
    render(<InputText name={INPUT_NAME} onChange={onChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'test' } })

    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
  })

  it('should be disabled', () => {
    render(<InputText name={INPUT_NAME} disabled />)
    const input = screen.getByRole('textbox')

    expect(input).toBeDisabled()
  })

  it('should trigger onBlur properly', () => {
    const onBlur = vi.fn()

    render(
      <>
        <InputText name={INPUT_NAME} onBlur={onBlur} data-testid={INPUT_NAME} />
        <InputText name="input2" data-testid="input2" />
      </>
    )

    const input = screen.getByTestId(INPUT_NAME)
    const input2 = screen.getByTestId('input2')

    input.focus()
    input2.focus()

    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
