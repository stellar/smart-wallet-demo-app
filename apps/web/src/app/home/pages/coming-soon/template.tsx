import { BrandTightHeading } from 'src/components/molecules'
import { Heading } from '@stellar/design-system'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { c } from 'src/interfaces/cms/useContent'
import { a } from 'src/interfaces/cms/useAssets'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'

export const ComingSoonTemplate = () => {
  return (
    <div>
      <OnboardingBackgroundImage isAnimated />
      <div className="mt-[calc(100vh-75vh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-6" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading
            className="-mb-2"
            lines={[c('comingSoonTitleLine1'), c('comingSoonTitleLine2'), c('comingSoonTitleLine3')]}
          />

          <Heading addlClassName="text-whitish leading-6" as="h2" size="xs">
            {c('comingSoonSubtitle')}
          </Heading>
        </div>
      </div>
    </div>
  )
}
