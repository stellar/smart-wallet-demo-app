import { Button, Text, Icon } from '@stellar/design-system'

import { Drawer } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  isOpen: boolean
  isTransferring: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmTransferDrawer = ({ isOpen, isTransferring, onClose, onConfirm }: Props) => {
  return (
    <Drawer closeButtonVariant="ghost" isOpen={isOpen} isLocked={isTransferring} onClose={onClose} hasCloseButton>
      <div className="flex flex-col text-center items-center gap-4 p-6 mt-5">
        <Icon.InfoCircle width={33} height={33} className="text-warning" />

        <Text as="h2" size="lg" weight="semi-bold">
          {c('confirmTransferDrawerTitle')}
        </Text>

        <Text as="div" size="sm">
          <Text as="span" size="sm" weight="medium" addlClassName="text-textSecondary">
            {`${c('confirmTransferDrawerDescription1')} `}
          </Text>
          <Text as="span" size="sm" weight="semi-bold" addlClassName="text-text">
            {`${c('confirmTransferDrawerDescription2')} `}
          </Text>
          <Text as="span" size="sm" weight="medium" addlClassName="text-textSecondary">
            {c('confirmTransferDrawerDescription3')}
          </Text>
        </Text>

        <Button variant="secondary" size="xl" isLoading={isTransferring} onClick={onConfirm} isRounded isFullWidth>
          {c('transfer')}
        </Button>
      </div>
    </Drawer>
  )
}
