import clsx from 'clsx'
import { ReactNode } from 'react'

import { NavbarButton } from '../navbar-button'
import './styles.css'

export interface HorizontalNavbarItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

interface Props {
  items: HorizontalNavbarItem[]
  activeItemId?: string
  className?: string
  itemClassName?: string
  maxWidth?: string
  showLabels?: boolean
  iconOnly?: boolean
}

export const HorizontalNavbar = ({
  items,
  activeItemId,
  className,
  itemClassName,
  maxWidth,
  showLabels = true,
  iconOnly = false,
}: Props) => {
  return (
    <div className={clsx('horizontal-navbar', className)} style={maxWidth ? { maxWidth } : undefined}>
      {items.map(item => {
        const isActive = activeItemId === item.id

        return (
          <NavbarButton
            key={item.id}
            isActive={isActive}
            icon={item.icon}
            label={item.label}
            showLabel={showLabels}
            iconOnly={iconOnly}
            disabled={item.disabled}
            onClick={item.onClick}
            data-testid={`navbar-item-${item.id}`}
            className={itemClassName}
            size="sm"
          />
        )
      })}
    </div>
  )
}
