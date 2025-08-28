import { Button, Text, Icon } from '@stellar/design-system'

import { BaseModalProps, ModalVariants } from '..'
import { NavigateButton } from '../../../molecules'

export type ModalTransferSuccessProps = {
  variant: Extract<ModalVariants, 'transfer-success'>
  title: string
  message: string
  button?: React.ComponentProps<typeof Button>
}

export const ModalTransferSuccess = ({
  title,
  message,
  button,
  internalState,
  onClose,
}: BaseModalProps & ModalTransferSuccessProps) => {
  const isLoading = internalState?.isLoading === true

  const handleTransferNft = () => {
    if (button?.onClick) {
      button.onClick({} as React.MouseEvent<HTMLButtonElement>)
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-4">
      <NavigateButton className="absolute top-4 right-4" type="close" onClick={isLoading ? undefined : onClose} />

      <div className="text-center mt-4">
        <div className="flex justify-center mb-7 items-center mx-auto">
          <Icon.CheckCircle size={56} className="text-success w-14 h-14" />
        </div>

        <Text as="h2" size="lg" weight="semi-bold" className="text-xl mb-2">
          {title}
        </Text>

        <Text as="p" size="md" className="text-textSecondary">
          {message}
        </Text>
      </div>

      {button && (
        <div className="flex flex-col gap-3">
          <Button
            isLoading={isLoading}
            {...button}
            onClick={handleTransferNft}
            variant="secondary"
            size="xl"
            isRounded
            isFullWidth
          >
            Go to Home
          </Button>
        </div>
      )}
    </div>
  )
}
