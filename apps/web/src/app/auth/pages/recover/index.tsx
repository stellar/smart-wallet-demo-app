import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { c } from 'src/interfaces/cms/useContent'

import { FormValues, schema } from './schema'
import { RecoverTemplate } from './template'
import { useSendRecoveryEmail } from '../../queries/use-send-recovery-email'
import { AuthPagesPath } from '../../routes/types'

export const Recover = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const toast = useToast()

  const sendRecoveryEmail = useSendRecoveryEmail({
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
