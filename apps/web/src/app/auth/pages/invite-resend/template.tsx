import { BlurredInput, BrandTightHeading } from 'src/components/molecules'
import { Button, Heading } from '@stellar/design-system'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { c } from 'src/interfaces/cms/useContent'
import { a } from 'src/interfaces/cms/useAssets'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'

type Props = {
  onSendLink: () => void
}

export const InviteResendTemplate = ({ onSendLink }: Props) => {
  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-75vh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-6" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading className="-mb-2" lines={[c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')]} />

          <Heading addlClassName="text-whitish leading-6" as="h2" size="xs">
            {c('inviteResendSubtitle')}
          </Heading>

          <BlurredInput id={''} fieldSize={'md'} placeholder={c('inviteResendInputPlaceholder')} />

          <div className="mt-3">
            <Button onClick={onSendLink} size="lg" variant="tertiary" isRounded isFullWidth>
              {c('sendLink')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
