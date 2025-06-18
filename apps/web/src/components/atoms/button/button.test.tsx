import { fireEvent, render, screen } from 'src/helpers/tests'

import { CustomIcon, CustomIconNames } from '../custom-icon'

import { Button, ButtonSize, ButtonVariant } from '.'

const BUTTON = 'button'
const BUTTON_LABEL = 'Click me'
const LOADING_SPINNER_TEST_ID = 'loading-spinner'
const BUTTON_ICON_TEST_ID = 'button-icon'
const onClickCallback = vi.fn()

const getButtonName = (param: ButtonVariant | ButtonSize): string => `I am a ${param} button!!!`

describe('Button component', () => {
  it('Display button label', () => {
    render(<Button label={BUTTON_LABEL} />)

    expect(screen.getByText(BUTTON_LABEL)).toBeInTheDocument()
  })

  it('Call onClick when click event happens', () => {
    render(<Button label={BUTTON_LABEL} onClick={onClickCallback} />)

    const button = screen.getByRole(BUTTON)
    fireEvent.click(button)

    expect(onClickCallback).toHaveBeenCalledTimes(1)
  })

  it('Render button with %s type', () => {
    Object.values(ButtonVariant).forEach(type => {
      const buttonName = getButtonName(type)
      render(<Button variant={type} label={buttonName} />)

      expect(screen.getByRole(BUTTON, { name: buttonName })).toBeInTheDocument()
    })
  })

  it('Render button with %s size', () => {
    Object.values(ButtonSize).forEach(size => {
      const buttonName = getButtonName(size)
      render(<Button size={size} label={buttonName} />)

      expect(screen.getByRole(BUTTON, { name: buttonName })).toBeInTheDocument()
    })
  })

  it('should render the LoadingSpinner within button text whilst loading', () => {
    render(<Button label={BUTTON_LABEL} loading />)
    const button = screen.getByRole(BUTTON)
    expect(button).toBeInTheDocument()

    const loadingSpinner = screen.getByTestId(LOADING_SPINNER_TEST_ID)
    expect(loadingSpinner).toBeInTheDocument()
  })

  it('should render the icon within button text whilst loading', () => {
    render(<Button label={BUTTON_LABEL} icon={<CustomIcon name={CustomIconNames['credit-card']} />} />)
    const button = screen.getByRole(BUTTON)
    expect(button).toBeInTheDocument()

    const icon = screen.getByTestId(BUTTON_ICON_TEST_ID)
    expect(icon).toBeInTheDocument()
  })
})
