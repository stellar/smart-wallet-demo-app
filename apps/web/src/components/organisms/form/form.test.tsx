import { fireEvent, waitFor } from '@testing-library/react'
import { render, screen } from 'src/helpers/tests'
import * as yup from 'yup'

import { useForm } from '.'

const CITIES = [
  {
    textValue: 'Florianópolis',
    value: 'floripa',
  },
  {
    textValue: 'Curitiba',
    value: 'curitiba',
  },
]

describe('[Form]', () => {
  it('Should render all input types', () => {
    const TestComponent = (): JSX.Element => {
      const onSubmit = async (): Promise<void> => {
        return
      }

      const { Form, handleSubmit } = useForm()
      return (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.InputText label="Name" name="name" />
          <Form.Select label="City" name="city" options={CITIES} />
          <input type="submit" value="Submit" />
        </Form>
      )
    }
    render(<TestComponent />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toBeInTheDocument()
  })

  it('Should submit all values when fields are filled', async () => {
    const mockOnSubmit = vi.fn()
    const TestComponent = (): JSX.Element => {
      const { Form, handleSubmit } = useForm()
      return (
        <Form onSubmit={handleSubmit(mockOnSubmit)}>
          <Form.InputText label="Name" name="name" />
          <Form.Select label="City" name="city" options={CITIES} />
          <input type="submit" value="Submit" />
        </Form>
      )
    }
    render(<TestComponent />)

    const NAME = 'My name'
    fireEvent.input(screen.getByLabelText('Name'), {
      target: {
        value: NAME,
      },
    })

    expect(screen.getByLabelText('City')).not.toHaveTextContent(CITIES[0].textValue)

    fireEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: CITIES[0].textValue }))
    expect(screen.getByLabelText('Name')).toHaveValue(NAME)
    expect(screen.getByLabelText('City')).toHaveTextContent(CITIES[0].textValue)

    fireEvent.click(screen.getByText('Submit'))

    await waitFor(() =>
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          name: 'My name',
          city: CITIES[0].value,
        },
        expect.any(Object)
      )
    )
  })

  it('Should display error if inputs are invalid', async () => {
    const TestComponent = (): JSX.Element => {
      const mockOnSubmit = vi.fn()

      const validationSchema = yup.object().shape({
        name: yup.string().required('name must be informed'),
        city: yup.string().required('city must be informed'),
      })

      const { Form, handleSubmit } = useForm({ validationSchema })
      return (
        <Form onSubmit={handleSubmit(mockOnSubmit)}>
          <Form.InputText label="Name" name="name" />
          <Form.Select label="City" name="city" options={CITIES} />
          <input type="submit" value="Submit" />
        </Form>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Submit'))

    expect(await screen.findByText('name must be informed')).toBeInTheDocument()
    expect(await screen.findByText('city must be informed')).toBeInTheDocument()
  })

  it('Should fill fields with initial value', () => {
    const INITIAL_VALUES = {
      name: 'My name',
      city: CITIES[0].value,
    }
    const TestComponent = (): JSX.Element => {
      const onSubmit = async (): Promise<void> => {
        return
      }

      const { Form, handleSubmit } = useForm({
        initialValues: INITIAL_VALUES,
      })
      return (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.InputText label="Name" name="name" />
          <Form.Select label="City" name="city" options={CITIES} />
          <input type="submit" value="Submit" />
        </Form>
      )
    }
    render(<TestComponent />)

    expect(screen.getByLabelText('Name')).toHaveValue(INITIAL_VALUES.name)
    expect(screen.getByLabelText('City')).toHaveTextContent(CITIES[0].textValue)
  })

  it('Should be able to use React Hook Forms api', async () => {
    const TestComponent = (): JSX.Element => {
      const mockOnSubmit = vi.fn()

      const validationSchema = yup.object().shape({
        name: yup.string().required('name must be informed'),
        city: yup.string().required('city must be informed'),
      })

      const { Form, watch, handleSubmit } = useForm({
        validationSchema,
      })
      const name = watch('name')
      return (
        <Form onSubmit={handleSubmit(mockOnSubmit)}>
          <span data-testid="greeting">Hi, {name}</span>
          <Form.InputText label="Name" name="name" />
          <Form.Select label="City" name="city" options={CITIES} />
          <input type="submit" value="Submit" />
        </Form>
      )
    }
    render(<TestComponent />)
    const mockedNameInput = 'My name'
    fireEvent.input(screen.getByLabelText('Name'), {
      target: {
        value: mockedNameInput,
      },
    })
    expect(screen.getByTestId('greeting')).toHaveTextContent(`Hi, ${mockedNameInput}`)
  })
})
