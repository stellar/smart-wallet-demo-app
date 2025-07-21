import clsx from 'clsx'
import { Button, ButtonProps } from '@stellar/design-system'

interface Props extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  invertColor?: boolean
  isBordered?: boolean
}

export const GhostButton = ({ invertColor, isBordered = false, ...props }: Omit<Props, 'variant'>) => {
  return (
    <div
      className={clsx({
        'ghost-button-container-bordered': isBordered,
        'ghost-button-container': !isBordered,
      })}
    >
      <Button variant={invertColor ? 'secondary' : 'tertiary'} {...props} />
    </div>
  )
}
