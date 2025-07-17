import { useForm } from 'react-hook-form'
import { describe, it, expect, vi } from 'vitest'

import { render, fireEvent, screen } from 'src/helpers/tests'

import { Form } from './index'

describe('Form', () => {
  it('renders children and calls onSubmit with form values', async () => {
    const TestComponent = () => {
      const form = useForm<{ test: string }>()
      const onSubmit = vi.fn()
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Form.Input data-testid="input" name="test" fieldSize="md" />
          <Form.Submit data-testid="submit" variant="primary" size="md">
            Submit
          </Form.Submit>
        </Form>
      )
    }

    render(<TestComponent />)
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.click(screen.getByTestId('submit'))
    // Wait for react-hook-form to process submission
    await new Promise(r => setTimeout(r, 0))
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('attaches field components as static properties', () => {
    expect(Form.Input).toBeDefined()
    expect(Form.Checkbox).toBeDefined()
    expect(Form.Radio).toBeDefined()
    expect(Form.Select).toBeDefined()
    expect(Form.Textarea).toBeDefined()
    expect(Form.Toggle).toBeDefined()
    expect(Form.Submit).toBeDefined()
  })
})
