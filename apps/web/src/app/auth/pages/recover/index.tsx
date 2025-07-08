import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { RecoverTemplate } from './template'
import { HomePagesPath } from 'src/app/home/routes/types'

export const Recover = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: HomePagesPath.HOME })
  }

  const handleResetLink = () => {
    throw new Error('Function not implemented.')
  }

  return <RecoverTemplate onGoBack={handleGoBack} onSendResetLink={handleResetLink} />
}
