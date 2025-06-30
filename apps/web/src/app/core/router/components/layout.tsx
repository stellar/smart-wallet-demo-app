import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuthStore } from 'src/app/auth/store/auth-store'

import { Typography, TypographyVariant } from 'src/components/atoms'
import { Header } from 'src/components/molecules'

export function Layout() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Header
      isAuthenticated={isAuthenticated}
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
