import { Badge, Button, CopyText, Icon, IconButton, Link, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { useMemo } from 'react'

import { createShortStellarAddress } from 'src/app/core/utils'
import { getExplorerUrl } from 'src/app/wallet/utils/explorer'
import { c } from 'src/interfaces/cms/useContent'

import { BaseModalProps, ModalVariants } from '..'
import { AssetAmount, NavigateButton } from '../../../molecules'

export type ModalTransactionDetailsProps = {
  variant: Extract<ModalVariants, 'transaction-details'>
  badge?: {
    variant: 'airdrop' | 'nft' | 'nft-treasure' | 'pay' | 'sent' | 'received' | 'organization'
  }
  date?: string
  vendor: {
    name: string
    imageUri?: string
    imageRadius?: 'full' | 'sm'
  }
  descriptionItems?: string[]
  actionType?: 'receive' | 'send'
  amount: {
    value: number
    asset: string
  }
  availableBalance?: number
  transactionHash?: string
  button?: React.ComponentProps<typeof Button>
}

export const ModalTransactionDetails = ({
  badge,
  date,
  vendor,
  descriptionItems,
  actionType,
  amount,
  availableBalance,
  transactionHash,
  button,
  internalState,
  backgroundImageUri,
  onClose,
}: BaseModalProps & ModalTransactionDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const year = date.getFullYear()

    return `${formattedDate}, ${formattedTime}, ${year}`
  }

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`
  }

  const ModalBadge = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="flex flex-col items-center">{children}</div>
    )

    switch (badge?.variant) {
      case 'airdrop':
        return (
          <Wrapper>
            <div className="yellow-badge">
              <Badge variant="success">{c('airdropBadge')}</Badge>
            </div>
          </Wrapper>
        )
      case 'nft':
        return (
          <Wrapper>
            <Badge variant="secondary">{c('nftBadge')}</Badge>
          </Wrapper>
        )
      case 'nft-treasure':
        return (
          <Wrapper>
            <Badge variant="secondary">{c('treasureBadge')}</Badge>
          </Wrapper>
        )
      case 'pay':
        return (
          <Wrapper>
            <Badge variant="primary">{c('payBadge')}</Badge>
          </Wrapper>
        )
      case 'sent':
        return (
          <Wrapper>
            <Badge variant="success">{c('sentBadge')}</Badge>
          </Wrapper>
        )
      case 'received':
        return (
          <Wrapper>
            <Badge variant="success">{c('receivedBadge')}</Badge>
          </Wrapper>
        )
      case 'organization':
        return (
          <Wrapper>
            <div className="pink-badge">
              <Badge variant="success">{c('organizationBadge')}</Badge>
            </div>
          </Wrapper>
        )

      default:
        return <></>
    }
  }

  const Amount = () => (
    <div className="flex flex-row justify-center items-center gap-1 break-all">
      {actionType && actionType === 'send' && <Icon.ArrowUpRight className="text-foreground" width={23} height={23} />}
      {actionType && actionType === 'receive' && (
        <Icon.ArrowDownRight className="text-foreground" width={23} height={23} />
      )}
      <AssetAmount amount={amount.value} amountVariant="max-decimal" asset={{ value: amount.asset, variant: 'lg' }} />
    </div>
  )

  const Vendor = ({ name }: { name: string }) => (
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
  )

  const Description = ({ descriptionItems }: { descriptionItems: string[] }) =>
    descriptionItems.length !== 0 && (
      <div className="flex flex-col items-center">
        {descriptionItems.length === 1 ? (
          <Text as="span" size="sm" weight="semi-bold" addlClassName="text-center break-words whitespace-normal">
            {descriptionItems[0]}
          </Text>
        ) : (
          descriptionItems.map((item, index) => (
            <Text
              as="span"
              size="sm"
              weight="semi-bold"
              addlClassName="text-center break-words whitespace-normal"
              key={index}
            >
              {`• ${item}`}
            </Text>
          ))
        )}
      </div>
    )

  const TopComponentWithImage = ({
    name,
    descriptionItems,
    imageUri,
    imageRadius,
  }: {
    name: string
    descriptionItems: string[]
    imageUri: string
    imageRadius: 'full' | 'sm'
  }) => (
    <div
      className={clsx(
        'flex flex-col gap-4 p-4 rounded-lg',
        !backgroundImageUri && 'bg-backgroundTertiary',
        !backgroundImageUri && badge?.variant === 'organization' && 'bg-pinkSecondary'
      )}
    >
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            'overflow-hidden w-[56px] h-[56px]',

            imageRadius === 'full' && 'rounded-full',
            imageRadius === 'sm' && 'rounded-[3.35px]'
          )}
        >
          <img src={imageUri} alt="Modal image" className="w-full h-full object-cover" />
        </div>
      </div>

      <Vendor name={name} />
      <Amount />
      <Description descriptionItems={descriptionItems} />
    </div>
  )

  const TopComponentWithoutImage = ({ name, descriptionItems }: { name: string; descriptionItems: string[] }) => (
    <div
      className={clsx(
        'flex flex-col gap-4 p-4 rounded-lg',
        !backgroundImageUri && 'bg-backgroundTertiary',
        !backgroundImageUri && badge?.variant === 'organization' && 'bg-pinkSecondary'
      )}
    >
      <Vendor name={name} />
      <Amount />
      <Description descriptionItems={descriptionItems} />
    </div>
  )

  const DateSection = () =>
    date && (
      <div className="flex flex-col gap-1">
        {/* Label */}
        <div className="flex flex-row items-center gap-1">
          <Text as="span" size="sm" weight="medium" addlClassName="text-textSecondary">
            {c('transactionModalTransactionDateLabel')}
          </Text>
        </div>

        {/* Transaction Date */}
        <div className="flex flex-row items-start rounded-lg p-0">
          <Text as="span" size="sm" weight="medium">
            {formatDate(date)}
          </Text>
        </div>
      </div>
    )

  const isLoading = useMemo(() => !!internalState?.isLoading, [internalState?.isLoading])

  return (
    <div className="flex flex-col gap-4">
      <NavigateButton
        className="absolute top-4 right-4"
        type="close"
        variant="ghost"
        onClick={isLoading ? undefined : onClose}
        invertColor={false}
        isBordered={false}
      />

      {/* Modal Badge */}
      <ModalBadge />

      {/* Top Section with Date, Type, and Amount */}
      {vendor.imageUri ? (
        <TopComponentWithImage
          name={vendor.name}
          descriptionItems={descriptionItems ?? []}
          imageUri={vendor.imageUri}
          imageRadius={vendor.imageRadius ?? 'full'}
        />
      ) : (
        <TopComponentWithoutImage name={vendor.name} descriptionItems={descriptionItems ?? []} />
      )}

      <DateSection />

      {/* Transaction ID Section */}
      {transactionHash && (
        <div className="flex flex-col gap-1">
          {/* Label */}
          <div className="flex flex-row items-center gap-1">
            <Text as="span" size="sm" weight="medium" addlClassName="text-textSecondary">
              {c('transactionModalTransactionIdLabel')}
            </Text>
          </div>

          {/* Transaction ID */}
          <div className="flex flex-row items-start rounded-lg p-0">
            <div className="flex flex-row items-center gap-2">
              <Link href={getExplorerUrl(transactionHash)} size="sm">
                {truncateHash(transactionHash)}
              </Link>

              {/* Copy Button */}
              <CopyText
                textToCopy={getExplorerUrl(transactionHash)}
                title={c('transactionModalCopyTransactionIdTitle')}
              >
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
        <div className="flex flex-row gap-1 text-textSecondary items-center break-words">
          <Text as="span" size="sm" weight="medium" addlClassName="text-center">
            {c('transactionModalAvailableBalanceLabel')}
          </Text>
          <AssetAmount
            amount={availableBalance}
            amountColor="textSecondary"
            size="sm"
            weight="medium"
            asset={{ value: 'XLM', variant: 'lg' }}
          />
        </div>
      )}

      {/* Bottom Button */}
      {button && (
        <div>
          <Button isLoading={isLoading} {...button} />
        </div>
      )}
    </div>
  )
}
