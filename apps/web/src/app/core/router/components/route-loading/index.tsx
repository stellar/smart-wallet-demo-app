import { useEffect, useMemo } from 'react'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { useWalletStatusStore } from 'src/app/wallet/store'
import { Loading } from 'src/components/atoms'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'
import { setThemeColor } from 'src/helpers/theme-color'

type Props = {
  onboardingStyleVariant: OnboardingStyleVariant
}

export const RouteLoading = ({ onboardingStyleVariant }: Props) => {
  const { status: walletStatus } = useWalletStatusStore()

  const isSuccessWallet = useMemo(() => walletStatus === 'SUCCESS', [walletStatus])

  useEffect(() => {
    if (!isSuccessWallet) {
      setThemeColor('primary')
    }
  }, [isSuccessWallet])

  return (
    <div className="flex justify-center items-center h-full">
      {!isSuccessWallet && (
        <OnboardingBackgroundImage
          isAnimated={onboardingStyleVariant === 'meridian-2025'}
          backgroundPosition={onboardingStyleVariant === 'stellar-house' ? 'center' : undefined}
        />
      )}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Loading size="sm" />
      </div>
    </div>
  )
}
