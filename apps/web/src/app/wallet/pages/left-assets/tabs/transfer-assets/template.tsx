import { Badge, Text, Notification } from '@stellar/design-system'
import clsx from 'clsx'
import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import Skeleton from 'react-loading-skeleton'

import { formatNumber } from 'src/app/core/utils'
import { WalletAddressForm } from 'src/app/wallet/components'
import { WalletAddressFormValues } from 'src/app/wallet/components/wallet-address-form/schema'
import { Organization } from 'src/app/wallet/domain/models/organization'
import { AssetAmount } from 'src/components/molecules'
import { Collapse, CollapseItem } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  isLoadingBalance: boolean
  isLoadingOrganizations: boolean
  balanceAmount: number
  organizations: Organization[]
  standardTransferForm: UseFormReturn<WalletAddressFormValues>
  onOrganizationClick: (organization: Organization) => void
  onStandardTransferSubmit: (values: WalletAddressFormValues) => void
}

export const TransferAssetsTemplate = ({
  isLoadingBalance,
  isLoadingOrganizations,
  balanceAmount,
  organizations,
  standardTransferForm,
  onOrganizationClick,
  onStandardTransferSubmit,
}: Props) => {
  const OrganizationItem = ({ organization }: { organization: Organization }) => (
    <div>
      <button
        className={clsx(
          'w-full flex flex-col rounded-xl gap-2 py-3 px-4 text-left border border-borderPrimary',
          'active:shadow-sm active:border-borderSecondary'
        )}
        onClick={() => onOrganizationClick(organization)}
      >
        <div className="w-full flex items-center justify-between">
          <div className="text-text">
            <Text as="span" size={'sm'} weight={'medium'}>
              {organization.name}
            </Text>
          </div>

          <div>
            <img src={organization.profile_image} alt={organization.name} className="max-h-[100px] max-w-[100px]" />
          </div>
        </div>

        <div className="text-textSecondary">
          <Text as="p" size="sm">
            {organization.description}
          </Text>
        </div>
      </button>
    </div>
  )

  const OrganizationList = () => (
    <div className="flex flex-col gap-3">
      {isLoadingOrganizations ? (
        <Skeleton height={102} count={4} className="mb-[6px] rounded-xl" />
      ) : (
        organizations.map(organization => <OrganizationItem key={organization.name} organization={organization} />)
      )}
    </div>
  )

  const standardTransfer = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        {isLoadingBalance ? (
          <Skeleton height={32} />
        ) : (
          <AssetAmount amount={balanceAmount} size="lg" asset={{ value: 'XLM', variant: 'sm' }} />
        )}

        <WalletAddressForm
          form={standardTransferForm}
          submitButtonText={c('transfer')}
          isSubmitDisabled={balanceAmount === 0}
          onSubmit={onStandardTransferSubmit}
        />

        <Notification variant="warning" title={c('transferAssetsStandardTransferDisclaimer')} />
      </div>
    ),
    [balanceAmount, isLoadingBalance, onStandardTransferSubmit, standardTransferForm]
  )

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-background">
      <div className="flex">
        {isLoadingBalance ? (
          <Skeleton width={150} borderRadius={'6.25rem'} />
        ) : (
          <Badge variant="secondary">{`${formatNumber(balanceAmount)} ${c('transferAssetsBalanceText')}`}</Badge>
        )}
      </div>

      <Collapse>
        <CollapseItem
          title={{ text: c('transferAssetsOrganizationListTitle'), size: 'md', weight: 'semi-bold' }}
          description={{
            text: c('transferAssetsOrganizationListDescription'),
          }}
        >
          <OrganizationList />
        </CollapseItem>

        <CollapseItem
          title={{ text: c('transferAssetsStandardTransferTitle'), size: 'md', weight: 'semi-bold' }}
          description={{
            text: c('transferAssetsStandardTransferDescription'),
          }}
        >
          {standardTransfer}
        </CollapseItem>
      </Collapse>
    </div>
  )
}

export default TransferAssetsTemplate
