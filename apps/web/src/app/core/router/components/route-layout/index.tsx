import { Layout as SDSLayout } from '@stellar/design-system'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export function RouteLayout(): JSX.Element {
  return (
    <SDSLayout.Content>
      <Outlet />
      <TanStackRouterDevtools />
    </SDSLayout.Content>
  )
}
