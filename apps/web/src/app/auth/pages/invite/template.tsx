import { BlurredInput, BrandTightHeading, GhostButton } from 'src/components/molecules'

import { Button, Heading } from '@stellar/design-system'
import { NavigateButton } from 'src/components/molecules/navigate-button'

import { OnboardingBackgroundImage } from '../../components'
import { c } from 'src/interfaces/cms/useContent'
import { a } from 'src/interfaces/cms/useAssets'

type Props = {
  onNext: () => void
}

export const InviteTemplate = ({ onNext }: Props) => {
  return (
    <div>
      <OnboardingBackgroundImage className={'bg-[60%]'} />
      <div className="h-[calc(100vh-8vh)] flex flex-col justify-end px-8">
        <img className="text-primary mb-8" src={a('yellowLogo')} width={65} alt="Logo" style={{ color: 'red' }} />
        {/* <Logo className="text-primary mb-8" width={65} /> */}

        <BrandTightHeading lines={[c('onboardingTitleLine1'), c('onboardingTitleLine2')]} />

        <Heading addlClassName="text-whitish mt-1 mb-3 leading-6" as="h2" size="xs">
          {c('onboardingSubtitle')}
        </Heading>

        <div>
          <Button size="lg" variant="tertiary" isRounded isFullWidth>
            Send Link
          </Button>
          <BlurredInput fieldSize="sm" id="input" placeholder="Enter email address" />
        </div>

        <NavigateButton type="next" />

        <NavigateButton type="close" size="medium" />

        <GhostButton size={'md'} invertColor>
          Forgot password?
        </GhostButton>
      </div>
    </div>
  )
}
