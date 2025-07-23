import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { BrandTightHeading, GhostButton } from 'src/components/molecules'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  onCreateWallet: () => void
  onLogIn: () => void
  onForgotPassword: () => void
}

export const WelcomeTemplate = ({ onCreateWallet, onLogIn, onForgotPassword }: Props) => {
  return (
    <div>
      <OnboardingBackgroundImage isAnimated />
      <div className="mt-[calc(100vh-80vh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-6" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading className="-mb-2" lines={[c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')]} />

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('inviteSubtitle')}
          </Text>

          <Button onClick={onCreateWallet} size="lg" variant="tertiary" isRounded isFullWidth>
            {c('createAWallet')}
          </Button>

          <GhostButton onClick={onLogIn} size="lg" isRounded isFullWidth isBordered invertColor>
            {c('logIn')}
          </GhostButton>

          <GhostButton onClick={onForgotPassword} size="md" isRounded isFullWidth invertColor>
            {c('forgotPassword')}
          </GhostButton>
        </div>
      </div>
    </div>
  )
}
