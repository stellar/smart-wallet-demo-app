import { useEffect } from 'react'
import { useAccessTokenStore } from '../store/access-token'
import { AUTH_TOKEN_CHANNEL_KEY } from '../constants/storage'

export const useSyncAccessToken = () => {
  const { setAccessToken, clearAccessToken } = useAccessTokenStore()

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return

      switch (event.data.type) {
        case 'SET_TOKEN':
          // Update the token without rebroadcasting (prevent loops)
          setAccessToken(event.data.token, false)
          break

        case 'CLEAR_TOKEN':
          clearAccessToken(false)
          break
      }
    }

    const channel = new BroadcastChannel(AUTH_TOKEN_CHANNEL_KEY)

    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [setAccessToken, clearAccessToken])
}
