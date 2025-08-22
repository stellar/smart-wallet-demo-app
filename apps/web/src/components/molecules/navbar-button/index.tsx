import { Button, ButtonProps } from '@stellar/design-system'
import clsx from 'clsx'
import { ReactNode } from 'react'

import './styles.css'

interface Props extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  icon?: ReactNode
  label?: string
  showLabel?: boolean
  iconOnly?: boolean
}

export const NavbarButton = ({
  isActive = false,
  icon,
  label,
  showLabel = true,
  iconOnly = false,
  className,
  ...props
}: Omit<Props, 'variant'>) => {
  return (
    <div
      className={clsx('navbar-button-container', {
        'navbar-button-container--active': isActive,
        'navbar-button-container--icon-only': iconOnly,
      })}
    >
      <Button variant={isActive ? 'secondary' : 'tertiary'} className={clsx('navbar-button', className)} {...props}>
        {icon && <span className="navbar-button__icon">{icon}</span>}
        {!iconOnly && (
          <>
            {showLabel && label && <span className="navbar-button__label">{label}</span>}
            {!showLabel && props.children}
            {showLabel && !label && props.children}
          </>
        )}
      </Button>
    </div>
  )
}
