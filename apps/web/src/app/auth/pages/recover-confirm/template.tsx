import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { useTheme } from 'src/config/theme/provider'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  isRecoveringWallet: boolean
  onGoBack: () => void
  onCreatePasskey: () => void
}

export const RecoverConfirmTemplate = ({ isRecoveringWallet, onGoBack, onCreatePasskey }: Props) => {
  const { onboardingStyleVariant } = useTheme()

  return (
    <div>
      <OnboardingBackgroundImage
        className="bg-[60%]"
        backgroundPosition={onboardingStyleVariant === 'stellar-house' ? 'center' : undefined}
      />
      <div className="mt-[calc(100svh-71svh)] flex flex-col justify-start px-8">
        <NavigateButton className="mb-10" size="md" onClick={onGoBack} />

        <div className="flex flex-col gap-6">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('recoverConfirmTitle')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('recoverConfirmSubtitle')}
          </Text>

          <Button
            isLoading={isRecoveringWallet}
            onClick={onCreatePasskey}
            size="xl"
            variant="tertiary"
            isRounded
            isFullWidth
          >
            {c('createAPasskey')}
          </Button>
        </div>
      </div>
    </div>
  )
}
