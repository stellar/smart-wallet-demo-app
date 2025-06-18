import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useSignoutMutation } from 'src/app/auth/queries/signout'
import { useAuthStore } from 'src/app/auth/store/auth-store'

import { Typography, TypographyVariant } from 'src/components/atoms'
import { Header } from 'src/components/molecules'

export function Layout() {
  const { isAuthenticated, currentUser } = useAuthStore()
  const navigate = useNavigate()
  const { mutateAsync: signout } = useSignoutMutation()

  return (
    <Header
      isAuthenticated={isAuthenticated}
      loggedInLabel={`Welcome, ${currentUser?.data?.name}`}
      userName={currentUser?.data?.name || ''}
      onSignOut={async () => {
        await signout()
        navigate({ to: '/' })
      }}
      links={
        <div className="flex flex-row gap-4 items-center">
          <Typography variant={TypographyVariant.link} asChild>
            <Link to="/">Home</Link>
          </Typography>
          <Typography variant={TypographyVariant.link} asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Typography>
        </div>
      }
    >
      <Outlet />
      <TanStackRouterDevtools />
    </Header>
  )
}
