import { Icon, Text } from '@stellar/design-system'
import { useMemo } from 'react'

import { useWalletStatusStore } from 'src/app/wallet/store'
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
    <div className="flex justify-center items-center h-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-6">
          {/* Error Indicator */}
          <div className="text-danger">
            <Icon.XCircle width={'5vh'} height={'5vh'} />
          </div>

          {/* Description */}
          <Text as="span" size="md" weight="medium" addlClassName="text-center">
            {description}
          </Text>
        </div>
      </div>
    </div>
  )
}
