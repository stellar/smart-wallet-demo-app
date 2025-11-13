import { Button, Text } from '@stellar/design-system'
import clsx from 'clsx'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { mapTextWithLinks } from 'src/app/core/utils/map-text-with-links'
import { BrandTightHeading, GhostButton } from 'src/components/molecules'
import { useTheme } from 'src/config/theme/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  onCreateWallet: () => void
  onLogIn: () => void
  onForgotPassword: () => void
}

export const WelcomeTemplate = ({ onCreateWallet, onLogIn, onForgotPassword }: Props) => {
  const { onboardingStyleVariant } = useTheme()

  const Header = () => {
    switch (onboardingStyleVariant) {
      case 'meridian-2025':
        return (
          <>
            <img className="text-primary -mb-1" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />
            <BrandTightHeading className="-mb-2" lines={[c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')]} />
            <Text addlClassName="text-whitish" as="h3" size="md">
              {mapTextWithLinks([
                {
                  text: c('inviteSubtitle'),
                },
              ])}
            </Text>
          </>
        )
      case 'stellar-house':
        return (
          <div className="flex flex-col items-center gap-6 mb-8">
            <img src={a('horizontalLogo')} height={24} width={98} alt="Logo" />
            <img src={a('onboardingBrandLogo')} alt="Brand Logo" />

            <Text addlClassName="text-whitish text-center" as="h3" size="md">
              {c('inviteSubtitle')}
            </Text>
          </div>
        )
      default:
        return null
    }
  }

  const ActionButtons = () => {
    return (
      <div className="flex flex-col gap-4">
        <Button
          onClick={onCreateWallet}
          size="xl"
          variant={onboardingStyleVariant === 'meridian-2025' ? 'tertiary' : 'secondary'}
          isRounded
          isFullWidth
        >
          {c('createAWallet')}
        </Button>

        <div className="flex flex-col gap-2">
          <>
            {onboardingStyleVariant === 'meridian-2025' && (
              <GhostButton onClick={onLogIn} size="xl" isRounded isFullWidth isBordered invertColor>
                {c('logIn')}
              </GhostButton>
            )}

            {onboardingStyleVariant === 'stellar-house' && (
              <Button onClick={onLogIn} size="xl" variant="tertiary" isRounded isFullWidth>
                {c('logIn')}
              </Button>
            )}
          </>

          <GhostButton onClick={onForgotPassword} size="md" isRounded isFullWidth invertColor>
            {c('forgotPassword')}
          </GhostButton>
        </div>
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
          onboardingStyleVariant === 'meridian-2025' && 'mt-[calc(100svh-85svh)]',
          onboardingStyleVariant === 'stellar-house' && 'mt-[calc(100svh-71svh)]'
        )}
      >
        <div className="flex flex-col gap-6">
          <Header />

          <ActionButtons />
        </div>
      </div>
    </div>
  )
}
