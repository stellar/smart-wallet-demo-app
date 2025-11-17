import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { FormValues, schema } from './schema'
import { InviteResendTemplate } from './template'
import { useResendInviteEmail } from '../../queries/use-resend-invite-email'
import { AuthPagesPath } from '../../routes/types'

export const InviteResend = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const resendInviteEmail = useResendInviteEmail()

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
      form={form}
      isInviteLinkSent={resendInviteEmail.isSuccess}
      onGoBack={handleGoBack}
      onSendLink={handleSendLink}
    />
  )
}
