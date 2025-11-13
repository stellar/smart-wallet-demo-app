import { Text } from '@stellar/design-system'
import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { Form } from 'src/components/organisms'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues } from './schema'

type Props = {
  onboardingStyleVariant: OnboardingStyleVariant
  isLoggingIn: boolean
  isLoginLinkSent: boolean
  form: UseFormReturn<FormValues>
  onGoBack: () => void
  onLogIn: (values: FormValues) => void
}

export const LogInTemplate = ({
  onboardingStyleVariant,
  isLoginLinkSent,
  isLoggingIn,
  form,
  onGoBack,
  onLogIn,
}: Props) => {
  const { watch } = form

  const emailValue = watch('email')
  const isSendResetLinkDisabled = useMemo(() => !emailValue || isLoginLinkSent, [emailValue, isLoginLinkSent])

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
            {c('logInTitleLine1')}
            <br />
            {c('logInTitleLine2')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('logInSubtitle')}
          </Text>

          <Form form={form} onSubmit={onLogIn}>
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
                isLoading={isLoggingIn}
                size="xl"
                variant={onboardingStyleVariant === 'meridian-2025' ? 'tertiary' : 'secondary'}
                isRounded
                isFullWidth
              >
                {c('logIn')}
              </Form.Submit>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
