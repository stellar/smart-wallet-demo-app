import { Button, Text, Icon, IconButton } from '@stellar/design-system'
import { useMemo } from 'react'

import { Drawer, ImageCard } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { Nft } from '../../domain/models/nft'
import { isTreasureNft } from '../../utils'
import { openExplorer } from '../../utils/explorer'
type Props = {
  nft: Nft | undefined
  isTransferDisabled: boolean
  onClose: () => void
  onTransferClick: () => void
}

export const ViewNftDrawer = ({ nft, isTransferDisabled, onClose, onTransferClick }: Props) => {
  const title = useMemo(() => `${nft?.name}${c('viewNftDrawerTitle')}`, [nft?.name])

  return (
    <Drawer size="max-height" isOpen={!!nft} onClose={onClose} hasCloseButton>
      <div className="flex flex-col mt-[61px] gap-8 p-6">
        {/* Title & Subtitle */}
        <div className="flex flex-col text-center gap-1">
          <div className="flex items-center justify-center gap-2">
            <Text as="h2" size="xl" weight="semi-bold">
              {title}
            </Text>
            {nft?.transaction_hash && (
              <IconButton
                icon={<Icon.LinkExternal01 />}
                altText="Stellar Explorer"
                onClick={() => openExplorer(nft.transaction_hash)}
                variant="default"
                className="w-4 h-4"
              />
            )}
          </div>
          <div className="text-textSecondary">
            <Text as="p" size="md" weight="medium">
              {c('viewNftDrawerSubtitle')}
            </Text>
          </div>
        </div>

        {/* NFT Image */}
        <div className="flex justify-center">
          {nft?.url && (
            <ImageCard
              size="lg"
              radius="min"
              imageUri={nft?.url}
              rightBadge={
                isTreasureNft(nft)
                  ? {
                      label: c('treasureBadge'),
                      variant: 'success',
                    }
                  : undefined
              }
              isClickable={false}
            />
          )}
        </div>

        {/* Transfer Button */}
        <Button
          variant={'secondary'}
          size={'lg'}
          disabled={isTransferDisabled}
          onClick={onTransferClick}
          isRounded
          isFullWidth
        >
          {c('transfer')}
        </Button>

        {/* Disabled Reason */}
        {isTransferDisabled && (
          <div className="text-center text-textSecondary">
            <Text as="p" size="sm">
              {c('viewNftDrawerDisclaimer')}
            </Text>
          </div>
        )}
      </div>
    </Drawer>
  )
}
