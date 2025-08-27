import { Layout as SDSLayout } from '@stellar/design-system'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useLayout } from '../service'

export function Layout(): JSX.Element {
  const layout = useLayout()

  if (layout === 'mobile') {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <main className="flex-1 overflow-auto">
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
