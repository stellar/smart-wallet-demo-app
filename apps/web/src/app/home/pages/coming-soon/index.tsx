import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'

import { ComingSoonTemplate } from './template'

export const ComingSoon = () => {
  return (
    <ComingSoonTemplate
      onboardingStyleVariant={import.meta.env.VITE_ONBOARDING_STYLE_VARIANT as OnboardingStyleVariant}
    />
  )
}
