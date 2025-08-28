import { useAccessTokenStore } from 'src/app/auth/store'
import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Loading } from 'src/components/atoms'

export const RouteLoading = () => {
  const { accessToken } = useAccessTokenStore()

  return (
    <div className="flex justify-center items-center h-full">
      {!accessToken && <OnboardingBackgroundImage />}

      <Loading />
    </div>
  )
}
