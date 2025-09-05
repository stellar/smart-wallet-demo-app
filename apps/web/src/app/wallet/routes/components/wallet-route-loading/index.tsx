import { Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { useWalletStatusStore } from 'src/app/wallet/store'
import { Loading } from 'src/components/atoms'
import { setThemeColor } from 'src/helpers/theme-color'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  overrideDescription?: string
}

export const WalletRouteLoading = ({ overrideDescription }: Props) => {
  const { status: walletStatus } = useWalletStatusStore()
  const [timeoutReached, setTimeoutReached] = useState(false)

  const isSuccessWallet = useMemo(() => walletStatus === 'SUCCESS', [walletStatus])

  useEffect(() => {
    if (!isSuccessWallet) {
      setThemeColor('primary')
    }
  }, [isSuccessWallet])

  // Trigger timeout after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setTimeoutReached(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  const description = useMemo(() => {
    if (timeoutReached) {
      return c('stuckWalletRouteLoadingDescription')
    }

    switch (walletStatus) {
      case 'PENDING':
        return c('walletStatusPending')
      case 'PROCESSING':
        return c('walletStatusProcessing')
      default:
        return c('defaultWalletRouteLoadingDescription')
    }
  }, [timeoutReached, walletStatus])

  return (
    <div className="flex justify-center items-center h-full">
      {!isSuccessWallet && <OnboardingBackgroundImage className="bg-[60%]" />}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={clsx('flex flex-col items-center gap-6', !isSuccessWallet && 'text-textTertiary')}>
          {/* Loading Indicator */}
          <Loading size="sm" color={isSuccessWallet ? 'text' : undefined} />

          {/* Description */}
          <Text as="span" size="md" weight="medium" addlClassName="text-center">
            {overrideDescription ? overrideDescription : description}
          </Text>
        </div>
      </div>
    </div>
  )
}
