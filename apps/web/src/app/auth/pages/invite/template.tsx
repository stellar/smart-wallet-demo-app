import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
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
  const config = isReturningUser
    ? {
        titleLines: [c('inviteOptionBTitleLine1'), c('inviteOptionBTitleLine2')],
        buttonText: c('logIn'),
        buttonAction: onLogIn,
        showForgot: true,
      }
    : {
        titleLines: [c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')],
        buttonText: c('createAWallet'),
        buttonAction: onCreateWallet,
        showForgot: false,
        gradientBottomPercentage: 60,
      }

  return (
    <div>
      <OnboardingBackgroundImage gradientBottomPercentage={config.gradientBottomPercentage} isAnimated />
      <div className="mt-[calc(100vh-75vh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-6" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading className="-mb-2" lines={config.titleLines} />

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('inviteSubtitle')}
          </Text>

          <Button
            onClick={config.buttonAction}
            isLoading={isCreatingWallet || isLoggingIn}
            size="lg"
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
    </div>
  )
}
