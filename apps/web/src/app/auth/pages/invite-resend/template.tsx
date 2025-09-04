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
  isInviteLinkSent: boolean
  onGoBack: () => void
  onSendLink: (values: FormValues) => void
}

export const InviteResendTemplate = ({ form, isInviteLinkSent, onGoBack, onSendLink }: Props) => {
  const { watch } = form

  const emailValue = watch('email')
  const isSendLinkDisabled = useMemo(() => !emailValue, [emailValue])

  return (
    <div>
      <OnboardingBackgroundImage className="bg-[60%]" />
      <div className="mt-[calc(100svh-71svh)] flex flex-col justify-start px-8">
        <NavigateButton className="mb-10" size="md" onClick={onGoBack} />

        <div className="flex flex-col gap-6">
          <Typography className="text-whitish" variant={TypographyVariant.h1} weight={TypographyWeight.bold}>
            {c('inviteResendTitleLine1')}
            <br />
            {c('inviteResendTitleLine2')}
          </Typography>

          <Text addlClassName="text-whitish" as="h3" size="md">
            {c('inviteResendSubtitle')}
          </Text>

          <Form form={form} onSubmit={onSendLink}>
            <div className="flex flex-col gap-6">
              <Form.Input
                name="email"
                variant="blurred"
                fieldSize={'lg'}
                placeholder={c('inviteResendInputPlaceholder')}
              />

              {isInviteLinkSent ? (
                <EmailSent />
              ) : (
                <Form.Submit disabled={isSendLinkDisabled} size="xl" variant="tertiary" isRounded isFullWidth>
                  {c('sendLink')}
                </Form.Submit>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
