import { Text } from '@stellar/design-system'
import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Typography, TypographyVariant, TypographyWeight } from 'src/components/atoms'
import { NavigateButton } from 'src/components/molecules'
import { Form } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues } from './schema'
import { EmailSent } from '../../components'

type Props = {
  form: UseFormReturn<FormValues>
  isResetLinkSent: boolean
  onGoBack: () => void
  onSendResetLink: (values: FormValues) => void
}

export const RecoverTemplate = ({ form, isResetLinkSent, onGoBack, onSendResetLink }: Props) => {
  const { watch } = form

  const emailValue = watch('email')
  const isSendResetLinkDisabled = useMemo(() => !emailValue, [emailValue])

  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-70vh)] flex flex-col justify-start px-8">
        <NavigateButton className="mb-10" size="md" onClick={onGoBack} />

        <div className="flex flex-col gap-4">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('recoverTitle')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('recoverSubtitle')}
          </Text>

          <Form form={form} onSubmit={onSendResetLink}>
            <Form.Input
              name="email"
              variant="blurred"
              fieldSize={'md'}
              placeholder={c('recoverEmailInputPlaceholder')}
            />

            <div className="mt-3">
              {isResetLinkSent ? (
                <EmailSent />
              ) : (
                <Form.Submit disabled={isSendResetLinkDisabled} size="lg" variant="tertiary" isRounded isFullWidth>
                  {c('sendResetLink')}
                </Form.Submit>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
