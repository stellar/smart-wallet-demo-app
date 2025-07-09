import { useMemo } from 'react'
import { BrandTightHeading } from 'src/components/molecules'
import { Heading } from '@stellar/design-system'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { c } from 'src/interfaces/cms/useContent'
import { a } from 'src/interfaces/cms/useAssets'
import { ONBOARDING_LOGO_WIDTH } from 'src/app/core/constants/onboarding'
import { Form } from 'src/components/organisms'
import { UseFormReturn } from 'react-hook-form'
import { FormValues } from './schema'

type Props = {
  form: UseFormReturn<FormValues>
  onSendLink: () => void
}

export const InviteResendTemplate = ({ form, onSendLink }: Props) => {
  const { watch } = form

  const emailValue = watch('email')
  const isSendLinkDisabled = useMemo(() => !emailValue, [emailValue])

  return (
    <div>
      <OnboardingBackgroundImage className="bg-[95%]" />
      <div className="mt-[calc(100vh-75vh)] flex flex-col justify-start px-8">
        <img className="text-primary mb-6" src={a('yellowLogo')} width={ONBOARDING_LOGO_WIDTH} alt="Logo" />

        <div className="flex flex-col gap-4">
          <BrandTightHeading className="-mb-2" lines={[c('inviteOptionATitleLine1'), c('inviteOptionATitleLine2')]} />

          <Heading addlClassName="text-whitish leading-6" as="h2" size="xs">
            {c('inviteResendSubtitle')}
          </Heading>

          <Form form={form} onSubmit={onSendLink}>
            <Form.Input
              name="email"
              variant="blurred"
              fieldSize={'md'}
              placeholder={c('inviteResendInputPlaceholder')}
            />

            <div className="mt-3">
              <Form.Submit disabled={isSendLinkDisabled} size="lg" variant="tertiary" isRounded isFullWidth>
                {c('sendLink')}
              </Form.Submit>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
