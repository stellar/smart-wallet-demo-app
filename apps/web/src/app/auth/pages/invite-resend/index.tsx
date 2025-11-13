import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { OnboardingStyleVariant } from 'src/constants/theme/onboarding-style'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues, schema } from './schema'
import { InviteResendTemplate } from './template'
import { useResendInviteEmail } from '../../queries/use-resend-invite-email'
import { AuthPagesPath } from '../../routes/types'

export const InviteResend = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const toast = useToast()

  const resendInviteEmail = useResendInviteEmail({
    onSuccess: () => {
      toast.notify({
        message: c('resetLinkSent'),
        type: Toast.toastType.SUCCESS,
      })
    },
  })

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: AuthPagesPath.WELCOME })
  }

  const handleSendLink = async (values: FormValues) => {
    await resendInviteEmail.mutateAsync({ email: values.email })
  }

  return (
    <InviteResendTemplate
      onboardingStyleVariant={import.meta.env.VITE_ONBOARDING_STYLE_VARIANT as OnboardingStyleVariant}
      form={form}
      isInviteLinkSent={resendInviteEmail.isSuccess}
      onGoBack={handleGoBack}
      onSendLink={handleSendLink}
    />
  )
}
