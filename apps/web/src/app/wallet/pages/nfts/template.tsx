import { Text } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { NavigateButton } from 'src/components/molecules'
import { ImageCard, SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { EmptyList } from '../../components'
import { Nft } from '../../services/wallet/types'

interface NftsTemplateProps {
  isLoadingNftsList: boolean
  nfts: Nft[]
  onGoBack: () => void
  onNftClick: (nft: Nft) => void
}

export const NftsTemplate = ({ isLoadingNftsList, nfts, onGoBack, onNftClick }: NftsTemplateProps) => {
  const isEmpty = !isLoadingNftsList && nfts.length === 0

  const NftListItem = ({ nft }: { nft: Nft }) => {
    return <ImageCard size="adapt" radius="min" imageUri={nft.url} onClick={() => onNftClick(nft)} />
  }

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />
        <Text as="h1" size="xl" className="text-xl leading-8 font-semibold">
          {c('nftsListTitle')}
        </Text>

        {isLoadingNftsList && <Skeleton height={56} count={8} className="mb-2" />}

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
