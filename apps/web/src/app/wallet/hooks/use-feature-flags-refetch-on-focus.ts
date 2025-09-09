import { useEffect, useRef } from 'react'

import { getFeatureFlags } from 'src/app/core/queries/use-get-feature-flags'
import { queryClient } from 'src/interfaces/query-client'

export function useFeatureFlagsRefetchOnFocus(throttleMs = 1000) {
  const lastCallRef = useRef(0)

  useEffect(() => {
    const refetchFeatureFlags = () => {
      const now = Date.now()
      if (now - lastCallRef.current < throttleMs) return
      lastCallRef.current = now

      queryClient.forceRefetch(getFeatureFlags())
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchFeatureFlags()
      }
    }

    window.addEventListener('focus', refetchFeatureFlags)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', refetchFeatureFlags)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [throttleMs])
}
