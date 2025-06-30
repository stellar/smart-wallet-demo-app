import { fireEvent } from '@testing-library/react'
import { render, screen } from 'src/helpers/tests'

import { InputCheckbox } from '.'

const INPUT_NAME = 'input-test'
const INPUT_CONTENT = 'content'

describe('Atom InputCheckbox', () => {
  it('Should render a InputCheckbox component', () => {
    render(<InputCheckbox name={INPUT_NAME}>{INPUT_CONTENT}</InputCheckbox>)
    const input = screen.getByRole('checkbox')
    expect(input).toBeInTheDocument()
    expect(screen.getByText(INPUT_CONTENT)).toBeInTheDocument()
    expect(input).toHaveAttribute('name', INPUT_NAME)
  })

  it('should trigger onChange properly when the use types', () => {
    const onChange = vi.fn()
    render(<InputCheckbox name={INPUT_NAME} onChange={onChange} />)
    const input = screen.getByRole('checkbox')
    fireEvent.click(input)
    expect(onChange).toHaveBeenCalled()
  })

  it('should be disabled', () => {
    render(<InputCheckbox name={INPUT_NAME} disabled />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
  })

  it('should trigger onBlur properly', () => {
    const onBlur = vi.fn()
    const otherInputName = 'input2'
    render(
      <>
        <InputCheckbox name={INPUT_NAME} onBlur={onBlur} data-testid={INPUT_NAME} />
        <InputCheckbox name={otherInputName} data-testid={otherInputName} />
      </>
    )
    const input = screen.getByTestId(INPUT_NAME)
    const input2 = screen.getByTestId(otherInputName)

    input.focus()
    input2.focus()

    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
