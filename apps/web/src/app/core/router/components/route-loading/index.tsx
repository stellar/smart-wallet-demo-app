import { useEffect, useMemo } from 'react'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { useWalletStatusStore } from 'src/app/wallet/store'
import { Loading } from 'src/components/atoms'
import { setThemeColor } from 'src/helpers/theme-color'

export const RouteLoading = () => {
  const { status: walletStatus } = useWalletStatusStore()

  const isSuccessWallet = useMemo(() => walletStatus === 'SUCCESS', [walletStatus])

  useEffect(() => {
    if (!isSuccessWallet) {
      setThemeColor('primary')
    }
  }, [isSuccessWallet])

  return (
    <div className="flex justify-center items-center h-full">
      {!isSuccessWallet && <OnboardingBackgroundImage isAnimated />}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Loading size="sm" />
      </div>
    </div>
  )
}
