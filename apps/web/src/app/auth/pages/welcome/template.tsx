import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { mapTextWithLinks } from 'src/app/core/utils/map-text-with-links'
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
      <div className="mt-[calc(100svh-85svh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-5" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-6">
          <BrandTightHeading className="-mb-2" lines={[c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')]} />

          <Text addlClassName="text-whitish" as="h3" size="md">
            {mapTextWithLinks([
              {
                text: c('inviteSubtitle'),
              },
              {
                text: c('inviteSubtitleLink'),
                // TODO: add link
                link: 'https://stellar.org/connect',
              },
            ])}
          </Text>

          <div className="flex flex-col gap-4">
            <Button onClick={onCreateWallet} size="xl" variant="tertiary" isRounded isFullWidth>
              {c('createAWallet')}
            </Button>

            <div className="flex flex-col gap-2">
              <GhostButton onClick={onLogIn} size="xl" isRounded isFullWidth isBordered invertColor>
                {c('logIn')}
              </GhostButton>

              <GhostButton onClick={onForgotPassword} size="md" isRounded isFullWidth invertColor>
                {c('forgotPassword')}
              </GhostButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
