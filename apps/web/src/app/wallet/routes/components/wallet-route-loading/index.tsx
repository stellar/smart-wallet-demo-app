import { Text } from '@stellar/design-system'
import { useEffect, useMemo, useState } from 'react'

import { useWalletStatusStore } from 'src/app/wallet/store/wallet-status'
import { Loading } from 'src/components/atoms'
import { c } from 'src/interfaces/cms/useContent'

export const WalletRouteLoading = () => {
  const { status: walletStatus } = useWalletStatusStore()
  const [timeoutReached, setTimeoutReached] = useState(false)

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
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col gap-6 px-11">
        {/* Loading Indicator */}
        <Loading />

        {/* Description */}
        <Text as="span" size="md" weight="medium" addlClassName="text-center">
          {description}
        </Text>
      </div>
    </div>
  )
}
