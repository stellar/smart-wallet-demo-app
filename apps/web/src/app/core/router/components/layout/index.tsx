import { Layout as SDSLayout } from '@stellar/design-system'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useLayout } from '../service'

export function Layout(): JSX.Element {
  const layout = useLayout()

  if (layout === 'mobile') {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <SDSLayout.Content>
            <Outlet />
            <TanStackRouterDevtools />
          </SDSLayout.Content>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  )
}
