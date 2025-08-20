import { Icon, Text } from '@stellar/design-system'
import { useMemo } from 'react'

import { useWalletStatusStore } from 'src/app/wallet/store/wallet-status'
import { c } from 'src/interfaces/cms/useContent'

export const WalletRouteError = () => {
  const { status: walletStatus } = useWalletStatusStore()

  const description = useMemo(() => {
    switch (walletStatus) {
      case 'FAILED':
        return c('walletStatusError')
      default:
        return c('defaultWalletRouteErrorDescription')
    }
  }, [walletStatus])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-6 px-11">
        {/* Error Indicator */}
        <div className="text-danger">
          <Icon.XCircle width={'10vh'} height={'10vh'} />
        </div>

        {/* Description */}
        <Text as="span" size="md" weight="medium" addlClassName="text-center">
          {description}
        </Text>
      </div>
    </div>
  )
}
