import { useEffect } from 'react'

import { WalletPagesPath } from 'src/app/wallet/routes/types'

import { AUTH_TOKEN_CHANNEL_KEY } from '../constants/storage'
import { useAccessTokenStore } from '../store/access-token'

/**
 * useSyncAccessToken is a custom hook that synchronizes the access token across
 * different browser tabs using the BroadcastChannel API. It listens for messages
 * on a broadcast channel specified by AUTH_TOKEN_CHANNEL_KEY. When a 'SET_TOKEN'
 * message is received, it sets the access token without rebroadcasting to avoid
 * loops. When a 'CLEAR_TOKEN' message is received, it clears the access token
 * without rebroadcasting. The hook ensures access token consistency across tabs
 * for authentication purposes.
 */
export const useSyncAccessToken = () => {
  const { setAccessToken, clearAccessToken } = useAccessTokenStore()

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return

      switch (event.data.type) {
        case 'SET_TOKEN':
          // Update the token without rebroadcasting (prevent loops)
          setAccessToken(event.data.token, WalletPagesPath.HOME, false)
          break

        case 'CLEAR_TOKEN':
          clearAccessToken(undefined, false)
          break
      }
    }

    const channel = new BroadcastChannel(AUTH_TOKEN_CHANNEL_KEY)

    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [setAccessToken, clearAccessToken])
}
