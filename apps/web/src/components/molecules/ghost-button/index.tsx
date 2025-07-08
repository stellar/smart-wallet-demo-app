import { Button, ButtonProps } from '@stellar/design-system'

interface Props extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  invertColor?: boolean
  isBordered?: boolean
}

export const GhostButton = ({ invertColor, isBordered = false, ...props }: Omit<Props, 'variant'>) => {
  return (
    <div className={`${isBordered ? 'ghost-button-container-bordered' : 'ghost-button-container'}`}>
      <Button variant={invertColor ? 'secondary' : 'tertiary'} {...props} />
    </div>
  )
}
