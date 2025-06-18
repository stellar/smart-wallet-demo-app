import { mockStoreState, renderWithRouter, screen, waitFor } from 'src/helpers/tests'

import { Layout } from './layout'
import { User } from 'src/app/auth/domain/models/user'
import { useAuthStore } from 'src/app/auth/store/auth-store'

// CONSTS
const LINK_LABELS = ['Home', 'Dashboard']
const USER: User = {
  email: 'john.doe@test.com',
  name: 'John Doe',
}

// FUNCTIONS
const renderComponent = () => renderWithRouter(<Layout />)
const mockSessionStore = mockStoreState(useAuthStore)

describe('Layout Component', () => {
  it('should render Home and Dashboard Links', async () => {
    renderComponent()

    await waitFor(() => {
      LINK_LABELS.forEach(label => {
        const link = screen.getByRole('link', { name: label })
        expect(link).toBeInTheDocument()
      })
    })
  })

  it('should render "You are not logged in" text if user IS NOT logged in', async () => {
    renderComponent()

    await waitFor(() => {
      const notLoggedInText = screen.getByText('You are not logged in')
      expect(notLoggedInText).toBeInTheDocument()
    })
  })

  it('should render welcome message and sign out button if user IS logged in', async () => {
    mockSessionStore({
      currentUser: {
        token: '1234214',
        data: USER,
      },
    })
    renderComponent()

    await waitFor(() => {
      const welcomeMessage = screen.getByText(`Welcome, ${USER.name}`)
      expect(welcomeMessage).toBeInTheDocument()

      const signOutButton = screen.getByRole('button', { name: 'Sign out' })
      expect(signOutButton).toBeInTheDocument()
    })
  })
})
