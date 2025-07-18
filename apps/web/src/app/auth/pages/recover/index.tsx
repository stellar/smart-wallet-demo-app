import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { RecoverTemplate } from './template'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues, schema } from './schema'
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
