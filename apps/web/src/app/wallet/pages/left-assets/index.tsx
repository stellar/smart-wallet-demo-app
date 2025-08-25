import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { HorizontalNavbar, NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { WalletPagesPath } from '../../routes/types'
import TransferAssets from './tabs/transfer-assets'
import TransferNfts from './tabs/transfer-nfts'

export const LeftAssets = () => {
  const navigate = useNavigate()
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
        return TransferAssets
      case 'transfer-nfts':
        return TransferNfts
      default:
        return TransferAssets
    }
  }, [activeTab])

  const handleGoBack = () => {
    navigate({
      to: WalletPagesPath.HOME,
      search: undefined,
      replace: true,
    })
  }

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
