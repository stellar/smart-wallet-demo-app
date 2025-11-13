import { Text } from '@stellar/design-system'
import clsx from 'clsx'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { Typography, TypographyFontFamily, TypographyVariant } from 'src/components/atoms'
import { BrandTightHeading } from 'src/components/molecules'
import { useTheme } from 'src/config/theme/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

export const ComingSoonTemplate = () => {
  const { onboardingStyleVariant } = useTheme()

  const Content = () => {
    switch (onboardingStyleVariant) {
      case 'meridian-2025':
        return (
          <div className="flex flex-col gap-4">
            <img className="text-primary -mb-1" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />
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
        )
      case 'stellar-house':
        return (
          <div className="flex flex-col items-center gap-6 mb-8">
            <Typography
              className="text-whitish text-xl"
              variant={TypographyVariant.label}
              fontFamily={TypographyFontFamily.lora}
            >
              {c('comingSoon')}
            </Typography>

            <img src={a('horizontalLogo')} height={24} width={98} alt="Logo" />
            <img src={a('onboardingBrandLogo')} alt="Brand Logo" />

            <Text addlClassName="text-whitish text-center" as="h3" size="md">
              {c('comingSoonSubtitleLine1')}
              <br />
              {c('comingSoonSubtitleLine2')}
            </Text>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <OnboardingBackgroundImage
        isAnimated={onboardingStyleVariant === 'meridian-2025'}
        backgroundPosition={onboardingStyleVariant === 'stellar-house' ? 'center' : undefined}
      />
      <div
        className={clsx(
          'flex flex-col px-8',
          onboardingStyleVariant === 'meridian-2025' && 'justify-start mt-[calc(100svh-80svh)]',
          onboardingStyleVariant === 'stellar-house' && 'justify-center h-screen'
        )}
      >
        <Content />
      </div>
    </div>
  )
}
