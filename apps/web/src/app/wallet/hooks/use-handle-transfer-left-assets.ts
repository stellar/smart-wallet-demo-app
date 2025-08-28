import { Icon } from '@stellar/design-system'
import { useEffect, useMemo } from 'react'

import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'
import { useTransferLeftAssetsStore } from '../store'

type HandleTransferLeftAssetsProps = {
  enabled: boolean
}

type HandleTransferLeftAssetsReturn = {
  banner: BannerOptions | undefined
}

export const useHandleTransferLeftAssets = ({
  enabled,
}: HandleTransferLeftAssetsProps): HandleTransferLeftAssetsReturn => {
  const { isFirstOpen: isTransferLeftAssetsFirstOpen, setIsFirstOpen: setIsTransferLeftAssetsFirstOpen } =
    useTransferLeftAssetsStore()

  const transferLeftAssetsModalKey = 'transfer-left-assets-modal'

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('transferLeftAssetsBannerBackground'),
      label: {
        title: c('transferLeftAssetsBannerTitle'),
        description: c('transferLeftAssetsBannerDescriptionA'),
        variant: 'secondary',
      },
      button: {
        title: c('transferLeftAssetsBannerButtonTitle'),
        icon: Icon.ArrowRight({ className: 'text-whitish' }),
        onClick: () => {
          // TODO: navigate to left-assets page
        },
      },
    }),
    []
  )

  const shouldOpenTransferLeftAssetsModal = useMemo(
    () => enabled && isTransferLeftAssetsFirstOpen,
    [enabled, isTransferLeftAssetsFirstOpen]
  )
  const shouldReturnBanner = useMemo(
    () => !shouldOpenTransferLeftAssetsModal && enabled,
    [enabled, shouldOpenTransferLeftAssetsModal]
  )

  useEffect(() => {
    if (shouldOpenTransferLeftAssetsModal) {
      modalService.open({
        key: transferLeftAssetsModalKey,
        variantOptions: {
          variant: 'default',
          textColor: 'white',
          title: {
            text: c('transferLeftAssetsBannerTitle'),
            image: {
              source: 'blank-space',
            },
          },
          description: c('transferLeftAssetsBannerDescriptionB'),
          button: {
            children: c('transferLeftAssetsBannerButtonTitle'),
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            icon: Icon.ArrowRight({ className: 'text-whitish' }),
            onClick: () => {
              // TODO: navigate to left-assets page
            },
          },
        },
        backgroundImageUri: a('transferLeftAssetsDefaultBackground'),
        onClose: () => setIsTransferLeftAssetsFirstOpen(false),
      })
    }
  }, [setIsTransferLeftAssetsFirstOpen, shouldOpenTransferLeftAssetsModal])

  return {
    banner: shouldReturnBanner ? banner : undefined,
  }
}
