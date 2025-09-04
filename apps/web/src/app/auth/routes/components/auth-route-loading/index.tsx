import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Loading } from 'src/components/atoms'

export const AuthRouteLoading = () => {
  return (
    <div>
      <OnboardingBackgroundImage className="bg-[60%]" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Loading size="sm" />
      </div>
    </div>
  )
}
