import { useMutation } from '@tanstack/react-query'

import authService, { SignInParams } from 'src/app/auth/services/auth'

import { useAuthStore } from '../store/auth-store'

export const useSigninMutation = () => {
  const { setCurrentUser } = useAuthStore()

  return useMutation({
    mutationKey: ['auth', 'signin'],
    mutationFn: async ({ email, password }: SignInParams) => {
      const { token, user } = await authService.signIn({ email, password })
      return { token, user }
    },
    onSuccess: data => {
      const { token, user } = data
      setCurrentUser({ token, data: user })
    },
  })
}
