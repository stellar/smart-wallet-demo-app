import { useNavigate } from '@tanstack/react-router'
import { useMemo, useEffect } from 'react'

import { featureFlagsState } from 'src/app/core/helpers'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { HomeTemplate, BannerOptions } from './template'
import { useInitTransfer } from '../../hooks/use-init-transfer'
import { useGetWallet } from '../../queries/use-get-wallet'
import { homeRoute } from '../../routes'
import { useAirdropStore } from '../../store'

export const Home = () => {
  const search = homeRoute.useSearch()
  const loaderDeps = homeRoute.useLoaderDeps()
  const navigate = useNavigate()

  const { isFirstOpen: isAirdropFirstOpen, setIsFirstOpen: setIsAirdropFirstOpen } = useAirdropStore()

  const [isAirdropActive] = featureFlagsState(['airdrop'])

  const getWallet = useGetWallet({
    enabled: !loaderDeps.shouldInitTransfer,
  })
  const walletData = getWallet.data

  useInitTransfer({
    params: search,
    enabled: loaderDeps.shouldInitTransfer,
  })

  const handlePayClick = () => navigate({ to: WalletPagesPath.SCAN })

  const handleNavbarButtonClick = (item: 'nft' | 'history' | 'profile') => {
    if (item === 'profile') {
      navigate({ to: WalletPagesPath.PROFILE })
    } else if (item === 'history') {
      navigate({ to: WalletPagesPath.TRANSACTIONS })
    } else if (item === 'nft') {
      navigate({ to: WalletPagesPath.NFTS })
    }
  }

  const isLoadingBalance = useMemo(() => {
    if (!walletData?.balance && loaderDeps.shouldInitTransfer) return true

    return getWallet.isPending
  }, [getWallet.isPending, loaderDeps.shouldInitTransfer, walletData?.balance])

  const shouldOpenAirdropModal = useMemo(
    () => isAirdropActive && isAirdropFirstOpen,
    [isAirdropActive, isAirdropFirstOpen]
  )

  const bannerOptions: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('airdropBannerBackground'),
      label: {
        title: c('airdropBannerTitle'),
        description: c('airdropBannerDescriptionA'),
        variant: 'primary',
      },
      button: {
        title: c('airdropBannerButtonTitle'),
        onClick: () => {
          // TODO: integrate claim functionality
          throw new Error('Function not implemented.')
        },
      },
    }),
    []
  )
  useEffect(() => {
    if (shouldOpenAirdropModal) {
      modalService.open({
        key: 'airdrop-modal',
        variantOptions: {
          variant: 'default',
          title: {
            text: c('airdropBannerTitle'),
            image: {
              source: 'blank-space',
            },
          },
          description: c('airdropBannerDescriptionB'),
          button: {
            children: c('airdropBannerButtonTitle'),
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            onClick: () => {
              alert('Airdrop claim button pressed')
            },
          },
        },
        backgroundImageUri: a('airdropDefaultBackground'),
        onClose: () => setIsAirdropFirstOpen(false),
      })
    }
  }, [setIsAirdropFirstOpen, shouldOpenAirdropModal])

  return (
    <HomeTemplate
      isLoadingBalance={isLoadingBalance}
      balanceAmount={walletData?.balance || 0}
      banner={shouldOpenAirdropModal ? undefined : bannerOptions}
      onNavbarButtonClick={handleNavbarButtonClick}
      onPayClick={handlePayClick}
    />
  )
}
