import { Button, ButtonProps } from '@stellar/design-system'

interface Props extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  invertColor?: boolean
}

export const GhostButton = ({ invertColor, ...props }: Omit<Props, 'variant'>) => {
  return (
    <div className="ghost-button-container">
      <Button variant={invertColor ? 'secondary' : 'tertiary'} {...props} />
    </div>
  )
}
