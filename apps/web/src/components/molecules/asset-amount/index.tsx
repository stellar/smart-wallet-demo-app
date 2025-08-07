import { Heading, Text } from '@stellar/design-system'
import { useMemo } from 'react'

import { createShortStellarAddress, formatNumber } from 'src/app/core/utils'

type Props = {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  weight?: React.ComponentProps<typeof Text>['weight']
  asset: {
    value: string
    variant: 'sm' | 'lg'
  }
}

export const AssetAmount = ({ amount, size = 'md', weight = 'semi-bold', asset }: Props) => {
  const formattedAmount = formatNumber(amount)
  const formattedAsset = createShortStellarAddress(asset.value, { onlyValidAddress: true })

  const amountText = useMemo(() => {
    switch (size) {
      case 'sm':
        return (
          <Text as="span" size="sm" weight={weight}>
            {formattedAmount}
          </Text>
        )
      case 'md':
        return (
          <Heading as={'h2'} size={'xs'} weight={weight}>
            {formattedAmount}
          </Heading>
        )
      case 'lg':
        return (
          <Heading as={'h1'} size={'xs'} weight={weight}>
            {formattedAmount}
          </Heading>
        )
    }
  }, [formattedAmount, size, weight])

  const lgAssetText = useMemo(() => {
    switch (size) {
      case 'sm':
        return (
          <Text as="span" size="sm" weight={weight}>
            {formattedAsset}
          </Text>
        )
      case 'md':
        return (
          <Heading as={'h2'} size={'xs'} weight={weight}>
            {formattedAsset}
          </Heading>
        )
      case 'lg':
        return (
          <Heading as={'h1'} size={'xs'} weight={weight}>
            {formattedAsset}
          </Heading>
        )
    }
  }, [formattedAsset, size, weight])

  return (
    <div className="flex items-baseline gap-1">
      {amountText}

      {asset.variant === 'sm' ? (
        <Text addlClassName={'text-textSecondary'} size={'md'} weight="medium" as="span">
          {createShortStellarAddress(asset.value, { onlyValidAddress: true })}
        </Text>
      ) : (
        lgAssetText
      )}
    </div>
  )
}
