import { render, screen } from 'src/helpers/tests'

import { CustomIcon, CustomIconNames } from '.'

test('Display icon', () => {
  render(<CustomIcon name={CustomIconNames.danger} alt="Danger" />)

  expect(screen.getByRole('img')).toBeInTheDocument()
  expect(screen.getByLabelText('Danger')).toBeInTheDocument()
  expect(screen.getByTitle('Danger')).toBeInTheDocument()
})
