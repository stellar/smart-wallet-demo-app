import { Text, Button, CopyText, Icon } from '@stellar/design-system'

import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms/typography'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { SafeAreaView } from 'src/components/organisms'
import { createShortWalletAddress } from 'src/helpers/format'
import { c } from 'src/interfaces/cms/useContent'

// Constants
const EXPLORER_BASE_URL = 'https://stellar.expert/explorer/public/account'

// Types
interface ProfileData {
  email: string
  walletAddress: string
}

interface ProfileTemplateProps {
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

const EmailSection = ({ email }: SectionProps) => (
  <div className="flex flex-col gap-2">
    <Text as="span" size="sm" className="text-textSecondary font-medium mb-1">
      {c('emailLabel')}
    </Text>
    <Typography
      variant={TypographyVariant.h3}
      weight={TypographyWeight.medium}
      className="text-lg text-text leading-[26px] mb-2"
    >
      {email}
    </Typography>
  </div>
)

const WalletAddressSection = ({ walletAddress }: WalletSectionProps) => {
  const shortWalletAddress = createShortWalletAddress(walletAddress)

  return (
    <div className="flex flex-col gap-2">
      <Text as="span" size="sm" className="text-textSecondary font-medium mb-1">
        {c('stellarWalletAddressLabel')}
      </Text>
      <div className="flex justify-between items-center gap-2 mb-2">
        <Typography
          variant={TypographyVariant.h3}
          weight={TypographyWeight.medium}
          className="text-lg text-text leading-[26px]"
        >
          {shortWalletAddress}
        </Typography>
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
    </div>
  )
}

const ExplorerLink = ({ walletAddress }: WalletSectionProps) => (
  <a
    href={`${EXPLORER_BASE_URL}/${walletAddress}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-brandPrimary font-semibold text-sm flex items-center gap-1 h-5 hover:underline"
  >
    {c('viewInExplorer')} <Icon.LinkExternal01 width={14} height={14} />
  </a>
)

const ProfileCard = ({ email, walletAddress }: ProfileData) => (
  <div className="bg-background rounded-default p-6 flex flex-col gap-4 w-full">
    <EmailSection email={email} />
    <WalletAddressSection walletAddress={walletAddress} />
    <ExplorerLink walletAddress={walletAddress} />
  </div>
)

export const ProfileTemplate = ({ email, walletAddress, onSignOut, onGoBack }: ProfileTemplateProps) => {
  return (
    <SafeAreaView>
      <div className="flex flex-col gap-8 mb-7">
        <NavigateButton variant="secondary" onClick={onGoBack} />
        <Typography variant={TypographyVariant.h1} weight={TypographyWeight.semibold} className="text-xl leading-8">
          {c('walletInfoTitle')}
        </Typography>
        <ProfileCard email={email} walletAddress={walletAddress} />
        <Button variant={'secondary'} size={'lg'} isRounded isFullWidth onClick={onSignOut}>
          {c('signOut')}
        </Button>
      </div>
    </SafeAreaView>
  )
}
