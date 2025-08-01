import { Text, Button, CopyText, Icon } from '@stellar/design-system'
import Skeleton from 'react-loading-skeleton'

import { createShortStellarAddress } from 'src/app/core/utils'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { SafeAreaView } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

// Types
interface ProfileData {
  email: string
  walletAddress: string
}

interface ProfileTemplateProps {
  isLoadingProfile: boolean
  email: string
  walletAddress: string
  onSignOut: () => void
  onGoBack: () => void
}

interface SectionProps {
  email: string
}

interface WalletSectionProps {
  walletAddress: string
}

export const ProfileTemplate = ({
  isLoadingProfile,
  email,
  walletAddress,
  onSignOut,
  onGoBack,
}: ProfileTemplateProps) => {
  const EmailSection = ({ email }: SectionProps) => (
    <div className="flex flex-col">
      <Text as="span" size="sm" className="text-textSecondary font-medium mb-1">
        {c('emailLabel')}
      </Text>
      {isLoadingProfile ? (
        <Skeleton height={26} />
      ) : (
        <Text as="div" size="lg" className="text-lg text-text leading-[26px] mb-2 font-medium">
          {email}
        </Text>
      )}
    </div>
  )

  const WalletAddressSection = ({ walletAddress }: WalletSectionProps) => {
    const shortWalletAddress = createShortStellarAddress(walletAddress)

    return (
      <div className="flex flex-col">
        <Text as="span" size="sm" className="text-textSecondary font-medium mb-1">
          {c('stellarWalletAddressLabel')}
        </Text>

        {isLoadingProfile ? (
          <Skeleton height={26} />
        ) : (
          <div className="flex justify-between items-center mb-2">
            <Text as="div" size="lg" className="text-lg text-text leading-[26px] font-medium">
              {shortWalletAddress}
            </Text>
            <CopyText textToCopy={walletAddress} title={c('copyAddressTitle')}>
              <Button
                variant="tertiary"
                size="sm"
                type="button"
                className="w-[26px] h-[26px] flex items-center justify-center rounded-full border border-border-primary bg-background"
              >
                <Icon.Copy01 width={12} height={12} className="text-foreground" />
              </Button>
            </CopyText>
          </div>
        )}
      </div>
    )
  }

  const ExplorerLink = ({ walletAddress }: WalletSectionProps) => {
    const isProduction = import.meta.env.PROD === true
    const explorerUrl = isProduction
      ? 'https://stellar.expert/explorer/public/contract'
      : 'https://stellar.expert/explorer/testnet/contract'

    return isLoadingProfile ? (
      <Skeleton height={20} />
    ) : (
      <a
        href={`${explorerUrl}/${walletAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brandPrimary font-semibold text-sm flex items-center gap-1 h-5 hover:underline"
      >
        {c('viewInExplorer')} <Icon.LinkExternal01 width={14} height={14} />
      </a>
    )
  }

  const ProfileCard = ({ email, walletAddress }: ProfileData) => (
    <div className="bg-background rounded-default p-6 flex flex-col gap-4 w-full">
      <EmailSection email={email} />
      <WalletAddressSection walletAddress={walletAddress} />
      <ExplorerLink walletAddress={walletAddress} />
    </div>
  )

  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />
        <Text as="h1" size="xl" className="text-xl leading-8 font-semibold">
          {c('walletInfoTitle')}
        </Text>
        <ProfileCard email={email} walletAddress={walletAddress} />
        <Button variant={'secondary'} size={'lg'} isRounded isFullWidth onClick={onSignOut}>
          {c('signOut')}
        </Button>
      </div>
    </SafeAreaView>
  )
}
