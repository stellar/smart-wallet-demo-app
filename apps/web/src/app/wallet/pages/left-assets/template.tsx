import { useState, useMemo, lazy, Suspense } from 'react'

import { Loading } from 'src/components/atoms'
import { HorizontalNavbar, NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

const TransferAssetsTab = lazy(() => import('../../components').then(module => ({ default: module.TransferAssetsTab })))
const TransferNftsTab = lazy(() => import('../../components').then(module => ({ default: module.TransferNftsTab })))

interface LeftAssetsTemplateProps {
  onGoBack: () => void
}

export const LeftAssetsTemplate = ({ onGoBack }: LeftAssetsTemplateProps) => {
  const [activeTab, setActiveTab] = useState('transfer-assets')

  const transferOptions = useMemo(
    () => [
      {
        id: 'transfer-assets',
        label: c('transferAssetsTabLabel'),
        onClick: () => setActiveTab('transfer-assets'),
      },
      {
        id: 'transfer-nfts',
        label: c('transferNftsTabLabel'),
        onClick: () => setActiveTab('transfer-nfts'),
      },
    ],
    []
  )

  const ActiveTabContent = useMemo(() => {
    switch (activeTab) {
      case 'transfer-assets':
        return TransferAssetsTab
      case 'transfer-nfts':
        return TransferNftsTab
      default:
        return TransferAssetsTab
    }
  }, [activeTab])

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-6 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />

        <HorizontalNavbar items={transferOptions} activeItemId={activeTab} />
        <div className="min-h-[400px]">
          <Suspense fallback={<Loading />}>
            <ActiveTabContent />
          </Suspense>
        </div>
      </div>
    </SafeAreaView>
  )
}

export default LeftAssetsTemplate
