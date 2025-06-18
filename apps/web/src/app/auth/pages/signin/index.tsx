import { useNavigate } from '@tanstack/react-router'

import { useSigninMutation } from 'src/app/auth/queries/signin'

import { SigninFormType } from './form'
import { SigninTemplate } from './template'
import { useGetPreviousRoute } from 'src/app/core/hooks/use-get-previous-route'

export function SignIn() {
  const navigate = useNavigate()
  const fromPath = useGetPreviousRoute()

  const { mutateAsync: signIn } = useSigninMutation()

  async function onSubmit({ email, password }: SigninFormType) {
    await signIn({ email, password })
    // Send them back to the page they tried to visit when they were
    // redirected to the login page. Use { replace: true } so we don't create
    // another entry in the history stack for the login page.  This means that
    // when they get to the protected page and click the back button, they
    // won't end up back on the login page, which is also really nice for the
    // user experience.
    navigate({ to: fromPath, replace: true })
  }

  return <SigninTemplate fromPath={fromPath} onSubmit={onSubmit} />
}
