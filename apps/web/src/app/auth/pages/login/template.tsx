import { Text } from '@stellar/design-system'
import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { Form } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues } from './schema'

type Props = {
  form: UseFormReturn<FormValues>
  onGoBack: () => void
  onLogIn: (values: FormValues) => void
}

export const LogInTemplate = ({ form, onGoBack, onLogIn }: Props) => {
  const { watch } = form

  const emailValue = watch('email')
  const isSendResetLinkDisabled = useMemo(() => !emailValue, [emailValue])

  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-65vh)] flex flex-col justify-start px-8">
        <NavigateButton className="mb-10" size="md" onClick={onGoBack} />

        <div className="flex flex-col gap-4">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('logInTitleLine1')}
            <br />
            {c('logInTitleLine2')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('logInSubtitle')}
          </Text>

          <Form form={form} onSubmit={onLogIn}>
            <Form.Input
              name="email"
              variant="blurred"
              fieldSize={'md'}
              placeholder={c('recoverEmailInputPlaceholder')}
            />

            <div className="mt-3">
              <Form.Submit disabled={isSendResetLinkDisabled} size="lg" variant="tertiary" isRounded isFullWidth>
                {c('logIn')}
              </Form.Submit>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
