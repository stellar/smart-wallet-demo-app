import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useDeepLinkStore } from 'src/app/core/store'

import { FormValues, schema } from './schema'
import { LogInTemplate } from './template'
import { useLogIn } from '../../queries/use-login'
import { logInRoute } from '../../routes'
import { AuthPagesPath } from '../../routes/types'
import { useEmailStore } from '../../store'

export const LogIn = () => {
  const router = useRouter()
  const search = logInRoute.useSearch()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const [isLoginLinkSent, setIsLoginLinkSent] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const logIn = useLogIn({
    onSuccess: result => {
      if (result.loginLinkSent) setIsLoginLinkSent(true)
      else setIsRedirecting(true)
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

  useEffect(() => {
    if (search.redirect) useDeepLinkStore.getState().setDeepLink(search.redirect)
  }, [search.redirect])

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
