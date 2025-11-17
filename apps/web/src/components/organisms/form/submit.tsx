import { Button, ButtonProps } from '@stellar/design-system'

import { GhostButton } from 'src/components/molecules'

import { useFormContextExtra } from './provider'

type Props = {
  variant: ButtonProps['variant'] | 'ghost'
} & Omit<React.ComponentProps<typeof Button>, 'variant'>

export function Submit({ children, variant, ...props }: Props) {
  const { submitting: formSubmitting } = useFormContextExtra()

  return variant === 'ghost' ? (
    <GhostButton type="submit" {...props}>
      {children}
    </GhostButton>
  ) : (
    <Button type="submit" variant={variant} isLoading={formSubmitting || props.isLoading} {...props}>
      {children}
    </Button>
  )
}
