import { useEffect, useMemo } from 'react'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { useWalletStatusStore } from 'src/app/wallet/store'
import { Loading } from 'src/components/atoms'
import { useTheme } from 'src/config/theme/provider'
import { setThemeColor } from 'src/helpers/theme-color'

export const RouteLoading = () => {
  const { onboardingStyleVariant } = useTheme()
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
