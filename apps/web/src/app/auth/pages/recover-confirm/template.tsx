import { Button, Text } from '@stellar/design-system'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { c } from 'src/interfaces/cms/useContent'

type Props = {
  onCreatePasskey: () => void
}

export const RecoverConfirmTemplate = ({ onCreatePasskey }: Props) => {
  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-55vh)] flex flex-col justify-start px-8">
        <div className="flex flex-col gap-4">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('recoverConfirmTitle')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('recoverConfirmSubtitle')}
          </Text>

          <div className="mt-3">
            <Button onClick={onCreatePasskey} size="lg" variant="tertiary" isRounded isFullWidth>
              {c('createAPasskey')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
