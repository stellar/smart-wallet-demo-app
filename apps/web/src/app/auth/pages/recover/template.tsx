import { useMemo } from 'react'
import { Heading } from '@stellar/design-system'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { c } from 'src/interfaces/cms/useContent'
import { NavigateButton } from 'src/components/molecules/navigate-button'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { UseFormReturn } from 'react-hook-form'
import { FormValues } from './schema'
import { Form } from 'src/components/organisms'

type Props = {
  form: UseFormReturn<FormValues>
  onGoBack: () => void
  onSendResetLink: () => void
}

export const RecoverTemplate = ({ form, onGoBack, onSendResetLink }: Props) => {
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
            {c('recoverTitle')}
          </Typography>

          <Heading addlClassName="text-whitish leading-6" as="h2" size="xs">
            {c('recoverSubtitle')}
          </Heading>

          <Form form={form} onSubmit={onSendResetLink}>
            <Form.Input
              name="email"
              variant="blurred"
              fieldSize={'md'}
              placeholder={c('recoverEmailInputPlaceholder')}
            />

            <div className="mt-3">
              <Form.Submit disabled={isSendResetLinkDisabled} size="lg" variant="tertiary" isRounded isFullWidth>
                {c('sendResetLink')}
              </Form.Submit>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
