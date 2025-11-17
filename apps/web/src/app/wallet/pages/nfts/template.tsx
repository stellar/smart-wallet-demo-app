import { Button, Icon, Text } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { NavigateButton } from 'src/components/molecules'
import { ImageCard, SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { EmptyList } from '../../components'
import { Nft } from '../../domain/models/nft'
import { isTreasureNft } from '../../utils'

interface NftsTemplateProps {
  isLoadingNftsList: boolean
  nfts: Nft[]
  onGoBack: () => void
  onScanClick: () => void
  onNftClick: (nft: Nft) => void
}

export const NftsTemplate = ({ isLoadingNftsList, nfts, onGoBack, onScanClick, onNftClick }: NftsTemplateProps) => {
  const isEmpty = !isLoadingNftsList && nfts.length === 0

  const NftListItem = ({ nft }: { nft: Nft }) => {
    return (
      <ImageCard
        size="adapt"
        radius="min"
        imageUri={nft.url}
        onClick={() => onNftClick(nft)}
        rightBadge={
          isTreasureNft(nft)
            ? {
                label: c('treasureBadge'),
                variant: 'success',
              }
            : undefined
        }
      />
    )
  }

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />

        <div className="flex justify-between items-start">
          <Text as="h1" size="xl" className="text-xl leading-8 font-semibold">
            {c('nftsListTitle')}
          </Text>

          <div className="relative h-8">
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Button variant="secondary" size="lg" icon={<Icon.Scan />} iconPosition="left" onClick={onScanClick}>
                {c('scan')}
              </Button>
            </div>
          </div>
        </div>

        {isLoadingNftsList && (
          <div className="grid grid-cols-2 gap-3 w-full">
            <Skeleton count={3} className="mb-2 rounded-xl w-full aspect-square" />
            <Skeleton count={3} className="mb-2 rounded-xl w-full aspect-square" />
          </div>
        )}

        {isEmpty && <EmptyList title={c('noNftsListTitle')} description={c('noNftsListDescription')} />}

        {!isEmpty && (
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-3 w-full">
              {nfts.map(nft => (
                <NftListItem key={nft.id} nft={nft} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SafeAreaView>
  )
}

export default NftsTemplate
