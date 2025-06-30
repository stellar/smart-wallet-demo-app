import { useRouter } from '@tanstack/react-router'

export const useGetPreviousRoute = (fallback = '/'): string => {
  const router = useRouter()
  const location = router.state.location
  const state = location.state as { from?: { pathname?: string } } | undefined

  return location.search.redirect || state?.from?.pathname || fallback
}
