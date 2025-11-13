import { Text } from '@stellar/design-system'
import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { Form } from 'src/components/organisms'
import { useTheme } from 'src/config/theme/provider'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues } from './schema'

type Props = {
  form: UseFormReturn<FormValues>
  isResetLinkSent: boolean
  onGoBack: () => void
  onSendResetLink: (values: FormValues) => void
}

export const RecoverTemplate = ({ isResetLinkSent, form, onGoBack, onSendResetLink }: Props) => {
  const { onboardingStyleVariant } = useTheme()
  const { watch } = form

  const emailValue = watch('email')
  const isSendResetLinkDisabled = useMemo(() => !emailValue || isResetLinkSent, [emailValue, isResetLinkSent])

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
            {c('recoverTitle')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('recoverSubtitle')}
          </Text>

          <Form form={form} onSubmit={onSendResetLink}>
            <div className="flex flex-col gap-6">
              <Form.Input
                name="email"
                type="email"
                variant={onboardingStyleVariant === 'meridian-2025' ? 'blurred' : 'default'}
                fieldSize={'lg'}
                placeholder={c('recoverEmailInputPlaceholder')}
              />

              <Form.Submit
                disabled={isSendResetLinkDisabled}
                size="xl"
                variant={onboardingStyleVariant === 'meridian-2025' ? 'tertiary' : 'secondary'}
                isRounded
                isFullWidth
              >
                {c('sendResetLink')}
              </Form.Submit>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
