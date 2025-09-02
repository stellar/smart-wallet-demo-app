import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Loading } from 'src/components/atoms'

export const AuthRouteLoading = () => {
  return (
    <div>
      <OnboardingBackgroundImage />
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    </div>
  )
}
