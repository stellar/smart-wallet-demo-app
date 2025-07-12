import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { InviteResendTemplate } from './template'
import { HomePagesPath } from 'src/app/home/routes/types'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues, schema } from './schema'

export const InviteResend = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: HomePagesPath.HOME })
  }

  const handleSendLink = () => {
    throw new Error('Function not implemented.')
  }

  return <InviteResendTemplate onGoBack={handleGoBack} form={form} onSendLink={handleSendLink} />
}
