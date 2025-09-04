import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { mapTextWithLinks } from 'src/app/core/utils/map-text-with-links'
import { BrandTightHeading, GhostButton } from 'src/components/molecules'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  isReturningUser: boolean
  isCreatingWallet: boolean
  isLoggingIn: boolean
  onCreateWallet: () => void
  onLogIn: () => void
  onForgotPassword: () => void
}

export const InviteTemplate = ({
  isReturningUser,
  isCreatingWallet,
  isLoggingIn,
  onCreateWallet,
  onLogIn,
  onForgotPassword,
}: Props) => {
  const config = !isReturningUser
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

  return (
    <div>
      <OnboardingBackgroundImage isAnimated />
      <div className="mt-[calc(100svh-80svh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-5" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-6">
          <BrandTightHeading className="-mb-2" lines={config.titleLines} />

          <Text addlClassName="text-whitish" as="h3" size="md">
            {mapTextWithLinks(config.subtitle)}
          </Text>

          <div className="flex flex-col gap-2">
            <Button
              onClick={config.buttonAction}
              isLoading={isCreatingWallet || isLoggingIn}
              size="xl"
              variant="tertiary"
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
        </div>

        {config.disclaimer && (
          <div className="mt-2 text-center">
            <Text addlClassName="text-textSecondary " as="span" size="xs">
              {mapTextWithLinks(config.disclaimer)}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
