import { render, screen } from 'src/helpers/tests'

import { Loading, withLoading } from '.'

// CONSTANTS
const LOADING_TEST_ID = 'loading-component'
const DUMMY_COMPONENT_TEST_ID = 'dummy-component'

describe('Loading component', () => {
  it('should render component without issues', () => {
    render(<Loading />)

    const loadingComponent = screen.getByTestId(LOADING_TEST_ID)
    expect(loadingComponent).toBeInTheDocument()
  })
})

describe('withLoading HOC component', () => {
  const DummyComponent = () => <div data-testid="dummy-component">Dummy Component</div>

  it('should render Loading component if loading state is true', () => {
    render(withLoading(<DummyComponent />)(true))

    const loadingComponent = screen.getByTestId(LOADING_TEST_ID)
    const dummyComponent = screen.queryByTestId(DUMMY_COMPONENT_TEST_ID)

    expect(loadingComponent).toBeInTheDocument()
    expect(dummyComponent).not.toBeInTheDocument()
  })

  it('should render Dummy component if loading state is false', () => {
    render(withLoading(<DummyComponent />)(false))

    const loadingComponent = screen.queryByTestId(LOADING_TEST_ID)
    const dummyComponent = screen.getByTestId(DUMMY_COMPONENT_TEST_ID)

    expect(loadingComponent).not.toBeInTheDocument()
    expect(dummyComponent).toBeInTheDocument()
  })
})
