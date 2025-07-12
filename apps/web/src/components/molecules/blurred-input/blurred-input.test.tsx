import { describe, it, expect } from 'vitest'
import { render, screen } from 'src/helpers/tests'
import { BlurredInput } from './index'

describe('BlurredInput', () => {
  it('passes props to the Input component', async () => {
    render(
      <BlurredInput
        id="test-id"
        data-testid="test-id"
        name="test-name"
        placeholder="Type here"
        value="hello"
        data-custom="custom"
        fieldSize={'lg'}
      />
    )
    const input = screen.getByTestId('test-id')
    expect(input).toHaveAttribute('id', 'test-id')
    expect(input).toHaveAttribute('name', 'test-name')
    expect(input).toHaveAttribute('placeholder', 'Type here')
    expect(input).toHaveValue('hello')
    expect(input).toHaveAttribute('data-custom', 'custom')
  })
})
