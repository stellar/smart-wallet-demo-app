import { fireEvent } from '@testing-library/react'

import { render, screen } from 'src/helpers/tests'

import { InputRadio } from '.'

const INPUT_NAME = 'input-test'
const INPUT_CONTENT = 'content'

describe('Atom InputRadio', () => {
  it('Should render a InputRadio component', () => {
    render(<InputRadio name={INPUT_NAME}>{INPUT_CONTENT}</InputRadio>)
    const input = screen.getByRole('radio')
    expect(input).toBeInTheDocument()
    expect(screen.getByText(INPUT_CONTENT)).toBeInTheDocument()
    expect(input).toHaveAttribute('name', INPUT_NAME)
  })

  it('should trigger onChange properly when the use types', () => {
    const onChange = vi.fn()
    render(<InputRadio name={INPUT_NAME} onChange={onChange} />)
    const input = screen.getByRole('radio')
    fireEvent.click(input)
    expect(onChange).toHaveBeenCalled()
  })

  it('should be disabled', () => {
    render(<InputRadio name={INPUT_NAME} disabled />)
    const input = screen.getByRole('radio')
    expect(input).toBeDisabled()
  })

  it('should trigger onBlur properly', () => {
    const onBlur = vi.fn()
    const otherInputName = 'input2'
    render(
      <>
        <InputRadio name={INPUT_NAME} onBlur={onBlur} data-testid={INPUT_NAME} />
        <InputRadio name={otherInputName} data-testid={otherInputName} />
      </>
    )
    const input = screen.getByTestId(INPUT_NAME)
    const input2 = screen.getByTestId(otherInputName)

    input.focus()
    input2.focus()

    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
