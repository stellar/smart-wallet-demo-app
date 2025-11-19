import { yupResolver } from '@hookform/resolvers/yup'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { useDeepLinkStore } from 'src/app/core/store'
import { c } from 'src/interfaces/cms/useContent'

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
  const toast = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const logIn = useLogIn({
    onSuccess: result => {
      if (result.loginLinkSent) {
        toast.notify({
          message: c('resetLinkSent'),
          type: Toast.toastType.SUCCESS,
        })
      } else setIsRedirecting(true)
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
      isLoginLinkSent={logIn.isSuccess}
      form={form}
      onGoBack={handleGoBack}
      onLogIn={handleLogIn}
    />
  )
}
