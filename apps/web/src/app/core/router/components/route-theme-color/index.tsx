import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

import { AuthPagesPath } from 'src/app/auth/routes/types'
import { setThemeColor } from 'src/helpers/theme-color'

export const RouteThemeColor = () => {
  const location = useLocation()

  useEffect(() => {
    switch (location.pathname) {
      case AuthPagesPath.WELCOME:
      case AuthPagesPath.INVITE:
        setThemeColor('#FDDA24')
        break
      case AuthPagesPath.LOGIN:
      case AuthPagesPath.RECOVER:
      case AuthPagesPath.RECOVER_CONFIRM:
      case AuthPagesPath.INVITE_RESEND:
        setThemeColor('#000000')
        break
      default:
        setThemeColor('#F2F2F7')
    }
  }, [location.pathname])

  return null
}
