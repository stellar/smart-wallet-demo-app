import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useDeepLinkStore } from 'src/app/core/store'

export const useDeepLink = () => {
  const navigate = useNavigate()
  const { deepLink, clearDeepLink } = useDeepLinkStore()

  useEffect(() => {
    if (deepLink) {
      navigate({ to: deepLink, replace: true })
      clearDeepLink()
    }
  }, [clearDeepLink, deepLink, navigate])
}
