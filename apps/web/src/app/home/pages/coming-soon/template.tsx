import { Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { BrandTightHeading } from 'src/components/molecules'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

export const ComingSoonTemplate = () => {
  return (
    <div>
      <OnboardingBackgroundImage isAnimated />
      <div className="mt-[calc(100svh-80svh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-5" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading
            className="-mb-2"
            lines={[c('comingSoonTitleLine1'), c('comingSoonTitleLine2'), c('comingSoonTitleLine3')]}
          />

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('comingSoonSubtitleLine1')}
            <br />
            {c('comingSoonSubtitleLine2')}
          </Text>
        </div>
      </div>
    </div>
  )
}
