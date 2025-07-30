import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { FormValues, schema } from './schema'
import { RecoverTemplate } from './template'
import { useSendRecoveryEmail } from '../../queries/use-send-recovery-email'
import { AuthPagesPath } from '../../routes/types'

export const Recover = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const sendRecoveryEmail = useSendRecoveryEmail()

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: AuthPagesPath.WELCOME })
  }

  const handleResetLink = async (values: FormValues) => {
    await sendRecoveryEmail.mutateAsync({ email: values.email })
  }

  return (
    <RecoverTemplate
      form={form}
      isResetLinkSent={sendRecoveryEmail.isSuccess}
      onGoBack={handleGoBack}
      onSendResetLink={handleResetLink}
    />
  )
}
