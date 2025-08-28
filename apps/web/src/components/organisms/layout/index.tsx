import { useLayout } from 'src/interfaces/layout'

export function Layout({ children }: { children: React.ReactNode }): React.ReactNode {
  const layout = useLayout()

  if (layout === 'mobile') {
    return (
      <div
        className="relative w-full h-[100svh]"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <main className="absolute inset-0 flex flex-col overflow-auto">{children}</main>
      </div>
    )
  }

  return (
    <div className="relative h-[100svh] w-[768px] mx-auto">
      <main className="absolute inset-0 flex flex-col overflow-auto">{children}</main>
    </div>
  )
}
