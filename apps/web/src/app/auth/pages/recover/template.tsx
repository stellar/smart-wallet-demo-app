import { Button, Heading } from '@stellar/design-system'
import { BlurredInput } from 'src/components/molecules'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { c } from 'src/interfaces/cms/useContent'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'

type Props = {
  onGoBack: () => void
  onSendResetLink: () => void
}

export const RecoverTemplate = ({ onGoBack, onSendResetLink }: Props) => {
  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-65vh)] flex flex-col justify-start px-8">
        <NavigateButton className="mb-10" size="md" onClick={onGoBack} />

        <div className="flex flex-col gap-4">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('recoverTitle')}
          </Typography>

          <Heading addlClassName="text-whitish leading-6" as="h2" size="xs">
            {c('recoverSubtitle')}
          </Heading>

          <BlurredInput id={''} fieldSize={'md'} placeholder={c('recoverEmailInputPlaceholder')} />

          <div className="mt-3">
            <Button onClick={onSendResetLink} size="lg" variant="tertiary" isRounded isFullWidth>
              {c('sendResetLink')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
