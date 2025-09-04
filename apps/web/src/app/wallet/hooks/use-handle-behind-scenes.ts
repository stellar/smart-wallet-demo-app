import { Icon } from '@stellar/design-system'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'

import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'
import { useBehindScenesStore } from '../store'

type HandleBehindScenesProps = {
  enabled: boolean
}

type HandleBehindScenesReturn = {
  banner: BannerOptions | undefined
}

const BEHIND_SCENES_URL = 'https://github.com/stellar/smart-wallet-demo-app'

export const useHandleBehindScenes = ({ enabled }: HandleBehindScenesProps): HandleBehindScenesReturn => {
  const router = useRouter()
  const { isFirstOpen: isBehindScenesFirstOpen, setIsFirstOpen: setIsBehindScenesFirstOpen } = useBehindScenesStore()

  const behindScenesModalKey = 'transfer-left-assets-modal'

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('behindScenesBannerBackground'),
      label: {
        title: c('behindScenesBannerTitleA'),
        description: c('behindScenesBannerDescriptionA'),
        variant: 'secondary',
      },
      button: {
        variant: 'tertiary',
        title: c('behindScenesBannerButtonTitle'),
        icon: Icon.ArrowUpRight({ className: 'text-whitish' }),
        onClick: () => {
          window.open(BEHIND_SCENES_URL, '_blank', 'noopener,noreferrer')
        },
      },
    }),
    []
  )

  const shouldOpenBehindScenesModal = useMemo(
    () => enabled && isBehindScenesFirstOpen,
    [enabled, isBehindScenesFirstOpen]
  )
  const shouldReturnBanner = useMemo(
    () => !shouldOpenBehindScenesModal && enabled,
    [enabled, shouldOpenBehindScenesModal]
  )

  useEffect(() => {
    if (shouldOpenBehindScenesModal) {
      modalService.open({
        key: behindScenesModalKey,
        variantOptions: {
          variant: 'default',
          textColor: 'white',
          title: {
            text: c('behindScenesBannerTitleB'),
          },
          description: c('behindScenesBannerDescriptionB'),
          button: {
            children: c('behindScenesBannerButtonTitle'),
            variant: 'tertiary',
            size: 'xl',
            isRounded: true,
            icon: Icon.ArrowUpRight({ className: 'text-whitish' }),
            onClick: () => {
              window.open(BEHIND_SCENES_URL, '_blank', 'noopener,noreferrer')
              modalService.close()
            },
          },
        },
        backgroundImageUri: a('behindScenesDefaultBackground'),
        onClose: () => setIsBehindScenesFirstOpen(false),
      })
    }
  }, [router, setIsBehindScenesFirstOpen, shouldOpenBehindScenesModal])

  return {
    banner: shouldReturnBanner ? banner : undefined,
  }
}
