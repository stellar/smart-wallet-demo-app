import { Icon } from '@stellar/design-system'
import clsx from 'clsx'

import './styles.css'

type CustomCheckboxProps = {
  checked?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export const CustomCheckbox = ({ checked = false, size = 'md', className, onClick }: CustomCheckboxProps) => {
  const iconSizes = {
    sm: 8,
    md: 12,
    lg: 14,
  }

  return (
    <div
      className={clsx(
        'custom-checkbox',
        `custom-checkbox--size-${size}`,
        checked && 'custom-checkbox--checked',
        onClick && 'custom-checkbox--clickable',
        className
      )}
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && <Icon.Check size={iconSizes[size]} className="text-white" />}
    </div>
  )
}
