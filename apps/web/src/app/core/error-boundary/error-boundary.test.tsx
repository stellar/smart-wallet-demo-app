import { useState } from 'react'

import { fireEvent, render, screen } from 'src/helpers/tests'

import ErrorBoundary, { IErrorBoundaryProps } from '.'

const BUTTON = 'button'
const TEST_THROW_ERROR = 'Test ErrorBoundary: This error was thrown!'
const TEST_DISPLAY_MESSAGE_ERROR = 'Test ErrorBoundary: This is a display message!'
const DUMMY_COMPONENT_TEXT = 'This is a dummy children component'
const FALLBACK_COMPONENT_TESTID = 'fallback-component'
const DEFAULT_FALLBACK_COMPONENT_TESTID = 'default-fallback'

const { getByRole, getByTestId, getByText, queryByText } = screen
const getButton = (): HTMLElement => getByRole(BUTTON, { name: 'set error' })
const fallback = (): JSX.Element => <div data-testid={FALLBACK_COMPONENT_TESTID} />

const DummyComponent = (): JSX.Element => {
  const [error, setError] = useState<boolean>(false)
  const handleClick = (): void => {
    setError(true)
  }

  if (error) throw new Error(TEST_THROW_ERROR)

  return (
    <div>
      <p>This is a dummy children component</p>
      <button onClick={handleClick}>set error</button>
    </div>
  )
}

const renderComponent = (props?: IErrorBoundaryProps): void => {
  render(
    <ErrorBoundary {...props}>
      <DummyComponent />
    </ErrorBoundary>
  )
}

describe('ErrorBoundary component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => vi.fn())
  })

  it('should render the children (dummy component) without problems if no error is present', () => {
    renderComponent()

    const dummyComponent = getByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).toBeInTheDocument()
  })

  it('should render the fallback component if an error is thrown in the children component', () => {
    renderComponent({ fallback })

    // click button on dummy component and throw an error
    const button = getButton()
    fireEvent.click(button)

    // dummy component should be removed from the DOM
    const dummyComponent = queryByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).not.toBeInTheDocument()

    // render the fallback component
    expect(getByTestId(FALLBACK_COMPONENT_TESTID)).toBeInTheDocument()
  })

  it('should render the default fallback component with the thrown error as message', () => {
    renderComponent()

    // click button on dummy component and throw an error
    const button = getButton()
    fireEvent.click(button)

    // dummy component should be removed from the DOM
    const dummyComponent = queryByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).not.toBeInTheDocument()

    // render the default fallback component
    expect(getByTestId(DEFAULT_FALLBACK_COMPONENT_TESTID)).toBeInTheDocument()
    expect(getByText(TEST_THROW_ERROR)).toBeInTheDocument()
  })

  it('should render the default fallback component with the display message as message', () => {
    renderComponent({ displayMessage: TEST_DISPLAY_MESSAGE_ERROR })

    // click button on dummy component and throw an error
    const button = getButton()
    fireEvent.click(button)

    // dummy component should be removed from the DOM
    const dummyComponent = queryByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).not.toBeInTheDocument()

    // render the default fallback component
    expect(getByTestId(DEFAULT_FALLBACK_COMPONENT_TESTID)).toBeInTheDocument()
    expect(getByText(TEST_DISPLAY_MESSAGE_ERROR)).toBeInTheDocument()
  })

  it(`should re-render the children (dummy component) after reseting the error on default fallback
    component`, () => {
    renderComponent()

    // click button on dummy component and throw an error
    const button = getButton()
    fireEvent.click(button)

    // dummy component should be removed from the DOM
    let dummyComponent = queryByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).not.toBeInTheDocument()

    // render the default fallback component and click the reset button
    expect(getByTestId(DEFAULT_FALLBACK_COMPONENT_TESTID)).toBeInTheDocument()
    const resetButton = getByRole(BUTTON, { name: /click here to reset!/i })
    fireEvent.click(resetButton)

    //re-render the dummy children component
    dummyComponent = queryByText(DUMMY_COMPONENT_TEXT)
    expect(dummyComponent).toBeInTheDocument()
  })
})
