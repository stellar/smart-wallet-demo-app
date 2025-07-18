import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues, schema } from './schema'
import { AuthPagesPath } from '../../routes/types'
import { WalletPagesPath } from 'src/app/wallet/routes/types'
import { useEmailStore } from '../../store'
import { useLogIn } from '../../queries/use-login'
import { LogInTemplate } from './template'

export const LogIn = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const logIn = useLogIn({
    onSuccess: () => {
      navigate({ to: WalletPagesPath.HOME })
    },
  })

  const { email } = useEmailStore()

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      email: email ?? '',
    },
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: AuthPagesPath.WELCOME })
  }

  const handleLogIn = async (values: FormValues) => {
    await logIn.mutateAsync({ email: values.email })
  }

  return <LogInTemplate form={form} onGoBack={handleGoBack} onLogIn={handleLogIn} />
}
