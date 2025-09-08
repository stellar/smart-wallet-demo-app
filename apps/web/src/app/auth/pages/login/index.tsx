import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { FormValues, schema } from './schema'
import { LogInTemplate } from './template'
import { useLogIn } from '../../queries/use-login'
import { AuthPagesPath } from '../../routes/types'
import { useEmailStore } from '../../store'

export const LogIn = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const [isLoginLinkSent, setIsLoginLinkSent] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const logIn = useLogIn({
    onSuccess: result => {
      if (result.loginLinkSent) setIsLoginLinkSent(true)
      else {
        setIsRedirecting(true)
        navigate({ to: WalletPagesPath.HOME })
      }
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

  const handleLogIn = (values: FormValues) => {
    logIn.mutate({ email: values.email })
  }

  // Reset redirecting state when component mounts
  useEffect(() => {
    setIsRedirecting(false)
  }, [])

  return (
    <LogInTemplate
      isLoggingIn={logIn.isPending || isRedirecting}
      isLoginLinkSent={isLoginLinkSent}
      form={form}
      onGoBack={handleGoBack}
      onLogIn={handleLogIn}
    />
  )
}
