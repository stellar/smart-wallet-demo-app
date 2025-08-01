import { Badge, Button, CopyText, Icon, IconButton, Text } from '@stellar/design-system'

import { createShortStellarAddress } from 'src/app/core/utils'
import { c } from 'src/interfaces/cms/useContent'

import { BaseModalProps, ModalVariants } from '..'
import { AssetAmount, NavigateButton } from '../../../molecules'

export type ModalTransactionDetailsProps = {
  variant: Extract<ModalVariants, 'transaction-details'>
  date?: string
  source: {
    name: string
    imageUri?: string
  }
  amount: {
    value: number
    asset: string
  }
  availableBalance?: number
  transactionHash?: string
  button: React.ComponentProps<typeof Button>
}

export const ModalTransactionDetails = ({
  date,
  source,
  amount,
  availableBalance,
  transactionHash,
  button,
  onClose,
}: BaseModalProps & ModalTransactionDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`
  }

  const DateBadge = () =>
    date && (
      <div className="flex flex-col items-center">
        <Badge variant="tertiary">{formatDate(date)}</Badge>
      </div>
    )

  const Amount = () => (
    <div className="flex flex-col items-center break-all">
      <AssetAmount amount={amount.value} asset={{ value: amount.asset, variant: 'lg' }} />
    </div>
  )

  const TopComponentWithImage = ({ name, imageUri }: { name: string; imageUri: string }) => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <DateBadge />

        <div className="flex flex-col items-center">
          <div className="rounded-full overflow-hidden w-[78px] h-[78px]">
            <img src={imageUri} alt="Modal image" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Text
            as="span"
            size="lg"
            weight="medium"
            addlClassName="text-center text-textSecondary break-words whitespace-normal"
          >
            {createShortStellarAddress(name, { onlyValidAddress: true })}
          </Text>
        </div>
      </div>

      <Amount />
    </div>
  )

  const TopComponentWithoutImage = ({ name }: { name: string }) => (
    <div className="flex flex-col gap-2">
      <DateBadge />

      <div className="flex flex-col items-center gap-1">
        <Text
          as="span"
          size="lg"
          weight="medium"
          addlClassName="text-center text-textSecondary break-words whitespace-normal"
        >
          {createShortStellarAddress(name, { onlyValidAddress: true })}
        </Text>
      </div>

      <Amount />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Close Button - Positioned outside modal */}
      <NavigateButton className="absolute -top-10 right-0" type="close" variant="ghost" onClick={onClose} />

      {/* Top Section with Date, Type, and Amount */}
      {source.imageUri ? (
        <TopComponentWithImage name={source.name} imageUri={source.imageUri} />
      ) : (
        <TopComponentWithoutImage name={source.name} />
      )}

      {/* Transaction ID Section */}
      {transactionHash && (
        <div className="flex flex-col gap-2">
          {/* Label */}
          <div className="flex flex-row items-center gap-1">
            <Text as="span" size="sm" weight="medium" addlClassName="text-textSecondary">
              {c('transactionModalTransactionIdLabel')}
            </Text>
          </div>

          {/* Transaction ID */}
          <div className="flex flex-row items-start rounded-lg p-0">
            <div className="flex flex-row items-center gap-2">
              <Text as="span" size="md">
                {truncateHash(transactionHash)}
              </Text>

              {/* Copy Button */}
              <CopyText textToCopy={transactionHash} title={c('transactionModalCopyTransactionIdTitle')}>
                <IconButton
                  altText={c('transactionModalCopyTransactionIdTitle')}
                  icon={
                    <div className="flex flex-row justify-center items-center rounded-full w-[28px] h-[28px] px-2 py-1 bg-backgroundTertiary border border-borderPrimary">
                      <Icon.Copy01 width={12} height={12} className="text-foreground" />
                    </div>
                  }
                />
              </CopyText>
            </div>
          </div>
        </div>
      )}

      {/* Available Balance Section */}
      {availableBalance && (
        <div className="flex flex-row gap-1 text-textSecondary mx-auto items-center break-words">
          <Text as="span" size="sm" addlClassName="text-center">
            {c('transactionModalAvailableBalanceLabel')}
          </Text>
          <AssetAmount amount={availableBalance} size="sm" weight="regular" asset={{ value: 'XLM', variant: 'lg' }} />
        </div>
      )}

      {/* Bottom Button */}
      <div>
        <Button {...button} />
      </div>
    </div>
  )
}
