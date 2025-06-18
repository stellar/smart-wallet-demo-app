import { useMutation } from '@tanstack/react-query'

import authService from 'src/app/auth/services/auth'

import { useAuthStore } from '../store/auth-store'

export const useSignoutMutation = () => {
  const { setCurrentUser } = useAuthStore()

  return useMutation({
    mutationKey: ['auth', 'signout'],
    mutationFn: async () => {
      await authService.signOut()
    },
    onSuccess: () => {
      setCurrentUser(null)
    },
  })
}
