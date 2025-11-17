import { Button, Text, Icon } from '@stellar/design-system'
import { useEffect, useMemo } from 'react'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'

export type ModalTransferSuccessProps = {
  variant: Extract<ModalVariants, 'transfer-success'>
  title: string
  icon?: 'check' | 'heart'
  message?: string
  buttonText?: string
  button?: React.ComponentProps<typeof Button>
  autoClose?: boolean
}

export const ModalTransferSuccess = ({
  title,
  icon = 'check',
  message,
  buttonText,
  button,
  internalState,
  autoClose = false,
  onClose,
}: BaseModalProps & ModalTransferSuccessProps) => {
  const isLoading = internalState?.isLoading === true

  useEffect(() => {
    if (isLoading || !autoClose || !onClose) return

    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [autoClose, isLoading, onClose])

  const modalIcon = useMemo(() => {
    switch (icon) {
      case 'check':
        return <Icon.CheckCircle size={56} className="text-success w-14 h-14" />
      case 'heart':
        return <Icon.Heart size={56} className="text-pink w-14 h-14" />
      default:
        return <Icon.CheckCircle size={56} className="text-success w-14 h-14" />
    }
  }, [icon])

  return (
    <div className="flex flex-col gap-4 text-center">
      {!autoClose && (
        <NavigateButton className="absolute top-4 right-4" type="close" onClick={isLoading ? undefined : onClose} />
      )}

      <div className="py-3 flex justify-center items-center">{modalIcon}</div>

      <div>
        <Text as="span" size="xl" weight="bold">
          {title}
        </Text>
      </div>

      {message && (
        <Text as="span" size="md" weight="medium">
          {message}
        </Text>
      )}

      {button && (
        <Button isLoading={isLoading} {...button} variant="secondary" size="xl" isRounded isFullWidth>
          {buttonText}
        </Button>
      )}
    </div>
  )
}
