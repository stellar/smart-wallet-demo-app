import { Text } from '@stellar/design-system'
import clsx from 'clsx'

import { Loading } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { c } from 'src/interfaces/cms/useContent'

import { BaseModalProps, ModalVariants } from '..'

export type ModalLoadingProps = {
  variant: Extract<ModalVariants, 'loading'>
  description?: string
  closeButtonPosition?: 'inside' | 'outside'
  isLocked: boolean
}

export const ModalLoading = ({
  description,
  closeButtonPosition = 'inside',
  isLocked,
  onClose,
}: BaseModalProps & ModalLoadingProps) => {
  return (
    <div className="flex flex-col gap-6 py-10">
      {/* Close Button */}
      {!isLocked && (
        <NavigateButton
          className={clsx(
            'absolute',
            closeButtonPosition === 'inside' && 'top-4 right-4',
            closeButtonPosition === 'outside' && '-top-10 right-0'
          )}
          type="close"
          variant="ghost"
          onClick={onClose}
        />
      )}

      {/* Loading Indicator */}
      <Loading />

      {/* Description */}
      <Text as="span" size="md" weight="medium" addlClassName="text-center">
        {description || c('defaultLoadingDescription')}
      </Text>
    </div>
  )
}
