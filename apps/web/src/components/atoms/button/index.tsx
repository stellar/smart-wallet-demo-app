import * as React from 'react'

import { cva, VariantProps } from 'class-variance-authority'
import { cn } from 'src/helpers/style'

import styles from './styles.module.css'

export enum ButtonVariant {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
  ghost = 'ghost',
  destructive = 'destructive',
}

export enum ButtonSize {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export enum ButtonIconPosition {
  left = 'left',
  right = 'right',
}

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      tertiary: styles.tertiary,
      ghost: styles.ghost,
      destructive: styles.destructive,
    },
    size: {
      small: styles.small,
      medium: styles.medium,
      large: styles.large,
    },
    iconPosition: {
      left: styles.left,
      right: styles.right,
    },
  },
  defaultVariants: {
    variant: ButtonVariant.primary,
    size: ButtonSize.medium,
    iconPosition: ButtonIconPosition.left,
  },
})

export interface IButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * The content of the button
   */
  label?: string
  /**
   * Optional click handler
   */
  onClick?: () => void
  /**
   * Is the button disabled?
   */
  disabled?: boolean
  /**
   * Is the button loading?
   */
  loading?: boolean
  /**
   * A image component to display inside of the button
   */
  icon?: React.ReactElement | React.ReactNode
  /**
   * Classname to add custom css
   */
  className?: string
}

const LoadingSpinner = () => (
  <span className={styles.loadingWrapper} data-testid="loading-spinner">
    <span className={styles.loader} />
  </span>
)

const Button = ({
  label,
  onClick,
  size = 'medium',
  variant = 'primary',
  iconPosition = 'left',
  disabled = false,
  loading = false,
  icon,
  className,
  ...props
}: IButtonProps) => {
  const currentIcon = icon ? (
    <span className={styles.iconWrapper} data-testid="button-icon">
      {icon}
    </span>
  ) : null

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(buttonVariants({ size, variant, iconPosition }), className)}
      onClick={onClick}
    >
      {loading ? <LoadingSpinner /> : currentIcon}
      <span>{label}</span>
    </button>
  )
}

export { Button }
