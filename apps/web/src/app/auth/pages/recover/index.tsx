import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { FormValues, schema } from './schema'
import { RecoverTemplate } from './template'
import { AuthPagesPath } from '../../routes/types'

export const Recover = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: AuthPagesPath.WELCOME })
  }

  const handleResetLink = () => {
    throw new Error('Function not implemented.')
  }

  return <RecoverTemplate form={form} onGoBack={handleGoBack} onSendResetLink={handleResetLink} />
}
