import { Layout as SDSLayout } from '@stellar/design-system'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { RouteThemeColor } from '../route-theme-color'

export function RouteLayout(): JSX.Element {
  return (
    <SDSLayout.Content>
      <RouteThemeColor />
      <Outlet />
      <TanStackRouterDevtools />
    </SDSLayout.Content>
  )
}
