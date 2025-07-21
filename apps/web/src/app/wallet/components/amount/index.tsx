import { Heading, Text } from '@stellar/design-system'
import { formatNumber } from 'src/app/core/utils'

type Props = {
  amount: number
  asset?: 'XLM'
  assetVariant?: 'sm' | 'lg'
}

export const Amount = ({ amount, asset, assetVariant = 'sm' }: Props) => {
  return (
    <div className="flex items-baseline gap-1">
      <Heading as={'h1'} size={'xs'} weight="semi-bold">
        {formatNumber(amount)}
      </Heading>

      {assetVariant === 'sm' ? (
        <Text addlClassName={'text-textSecondary'} size={'md'} weight="medium" as="span">
          {asset}
        </Text>
      ) : (
        <Heading as={'h1'} size={'xs'} weight="semi-bold">
          {asset}
        </Heading>
      )}
    </div>
  )
}
