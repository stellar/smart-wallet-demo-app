import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'

import { HorizontalNavbar, NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import TransferAssets from './tabs/transfer-assets'
import TransferNfts from './tabs/transfer-nfts'
import { leftAssetsRoute } from '../../routes'
import { WalletPagesPath } from '../../routes/types'

export type LeftAssetsTab = 'transfer-assets' | 'transfer-nfts'

export const LeftAssets = () => {
  const router = useRouter()
  const search = leftAssetsRoute.useSearch()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const [activeTab, setActiveTab] = useState<LeftAssetsTab>(search.tab || 'transfer-assets')

  const transferOptions: { id: LeftAssetsTab; label: string; onClick: () => void }[] = useMemo(
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

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const ActiveTabContent = useMemo(() => {
    switch (activeTab) {
      case 'transfer-assets':
        return TransferAssets
      case 'transfer-nfts':
        return TransferNfts
      default:
        return TransferAssets
    }
  }, [activeTab])

  useEffect(() => {
    setActiveTab(search.tab || 'transfer-assets')
  }, [search.tab])

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-6 mb-7">
        <NavigateButton variant="secondary" onClick={handleGoBack} />

        <HorizontalNavbar items={transferOptions} activeItemId={activeTab} />
        <div className="min-h-[400px]">
          <ActiveTabContent />
        </div>
      </div>
    </SafeAreaView>
  )
}

export default LeftAssets
