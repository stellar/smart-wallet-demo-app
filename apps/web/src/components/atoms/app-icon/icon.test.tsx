import { render, screen } from 'src/helpers/tests'

import { AppIcon, AppIconNames } from '.'

describe('Atom Icon', () => {
  const iconNames = Object.values(AppIconNames)
  iconNames.forEach(iconName => {
    it(`renders AppIcon with ${iconName}`, () => {
      render(<AppIcon name={iconName} alt={iconName} />)

      expect(screen.getByLabelText(iconName)).toBeInTheDocument()
    })
  })
})
