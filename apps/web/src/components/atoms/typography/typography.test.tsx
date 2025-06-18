import { render, screen } from 'src/helpers/tests'

import { Typography, TypographyVariant } from '.'

const getTypographyText = (variant: TypographyVariant): string => `I am a ${variant} tag element`

describe('Atom Typography', () => {
  it('renders Typography with %s variant', () => {
    Object.values(TypographyVariant).forEach(variant => {
      const typographyText = getTypographyText(variant)
      render(<Typography variant={variant}>{typographyText}</Typography>)

      expect(screen.getByText(typographyText)).toBeInTheDocument()
    })
  })
})
