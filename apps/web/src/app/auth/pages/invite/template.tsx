import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { mapTextWithLinks } from 'src/app/core/utils/map-text-with-links'
import { Typography, TypographyFontFamily, TypographyVariant } from 'src/components/atoms'
import { BrandTightHeading, GhostButton } from 'src/components/molecules'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  onboardingStyleVariant: OnboardingStyleVariant
  isReturningUser: boolean
  isCreatingWallet: boolean
  isLoggingIn: boolean
  onCreateWallet: () => void
  onLogIn: () => void
  onForgotPassword: () => void
}

export const InviteTemplate = ({
  onboardingStyleVariant,
  isReturningUser,
  isCreatingWallet,
  isLoggingIn,
  onCreateWallet,
  onLogIn,
  onForgotPassword,
}: Props) => {
  const config = isReturningUser
    ? {
        titleLines: [c('inviteOptionBTitleLine1'), c('inviteOptionBTitleLine2')],
        subtitle: [
          {
            text: c('inviteSubtitle'),
          },
        ],
        buttonText: c('logIn'),
        buttonAction: onLogIn,
        showForgot: true,
      }
    : {
        titleLines: [c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')],
        subtitle: [
          {
            text: c('inviteSubtitle'),
          },
        ],

        disclaimer: [
          {
            text: c('inviteOptionADisclaimerText1'),
          },
          {
            text: c('inviteOptionADisclaimerText2'),
            link: import.meta.env.VITE_TERMS_OF_SERVICE_URL,
            removeBlankSpace: true,
          },
          {
            text: c('inviteOptionADisclaimerText3'),
          },
          {
            text: c('inviteOptionADisclaimerText4'),
            link: import.meta.env.VITE_PRIVACY_POLICY_URL,
            removeBlankSpace: true,
          },
          {
            text: c('inviteOptionADisclaimerText5'),
          },
          {
            text: c('inviteOptionADisclaimerText6'),
            link: import.meta.env.VITE_ADDENDUM_URL,
          },
        ],
        buttonText: c('createAWallet'),
        buttonAction: onCreateWallet,
        showForgot: false,
      }

  const Header = () => {
    switch (onboardingStyleVariant) {
      case 'meridian-2025':
        return (
          <>
            <img className="text-primary -mb-1" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />
            <BrandTightHeading className="-mb-2" lines={config.titleLines} />
            <Text addlClassName="text-whitish" as="h3" size="md">
              {mapTextWithLinks(config.subtitle)}
            </Text>
          </>
        )
      case 'stellar-house':
        return (
          <div className="flex flex-col items-center gap-6 mb-8">
            {isReturningUser ? (
              <Typography
                className="text-whitish text-xl"
                variant={TypographyVariant.label}
                fontFamily={TypographyFontFamily.lora}
              >
                {c('welcomeBack')}
              </Typography>
            ) : (
              <img src={a('horizontalLogo')} height={24} width={98} alt="Logo" />
            )}
            <img src={a('onboardingBrandLogo')} alt="Brand Logo" />

            <Text addlClassName="text-whitish text-center" as="h3" size="md">
              {mapTextWithLinks(config.subtitle)}
            </Text>
          </div>
        )
      default:
        return null
    }
  }

  const ActionButtons = () => {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={config.buttonAction}
          isLoading={isCreatingWallet || isLoggingIn}
          size="xl"
          variant={onboardingStyleVariant === 'meridian-2025' ? 'tertiary' : 'secondary'}
          isRounded
          isFullWidth
        >
          {config.buttonText}
        </Button>

        {config.showForgot && (
          <GhostButton onClick={onForgotPassword} size="md" isRounded isFullWidth invertColor>
            {c('forgotPassword')}
          </GhostButton>
        )}
      </div>
    )
  }

  return (
    <div>
      <OnboardingBackgroundImage
        isAnimated={onboardingStyleVariant === 'meridian-2025'}
        backgroundPosition={onboardingStyleVariant === 'stellar-house' ? 'center' : undefined}
      />
      <div
        className={clsx(
          'flex flex-col justify-start px-8',
          onboardingStyleVariant === 'meridian-2025' && 'mt-[calc(100svh-80svh)]',
          onboardingStyleVariant === 'stellar-house' && 'mt-[calc(100svh-71svh)]'
        )}
      >
        <div className="flex flex-col gap-6">
          <Header />

          <ActionButtons />
        </div>

        {config.disclaimer && (
          <div className="mt-2 text-center">
            <Text
              addlClassName={onboardingStyleVariant === 'stellar-house' ? 'text-whitish' : 'text-textSecondary'}
              as="span"
              size="xs"
            >
              {mapTextWithLinks(config.disclaimer)}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
