import { useMemo } from 'react'

import { useTheme } from 'src/config/theme/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { BannerOptions } from '../pages/home/template'

type HandleWalletComingSoonProps = {
  enabled: boolean
}

type HandleWalletComingSoonReturn = {
  banner: BannerOptions | undefined
}

export const useHandleWalletComingSoon = ({ enabled }: HandleWalletComingSoonProps): HandleWalletComingSoonReturn => {
  const { onboardingStyleVariant } = useTheme()

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('walletComingSoonBannerBackground'),
      label: {
        title: c('walletComingSoonBannerTitle'),
        description: c('walletComingSoonBannerDescription'),
        variant: onboardingStyleVariant === 'stellar-house' ? 'secondary' : 'primary',
      },
    }),
    [onboardingStyleVariant]
  )

  const shouldReturnBanner = useMemo(() => enabled, [enabled])

  return {
    banner: shouldReturnBanner ? banner : undefined,
  }
}
