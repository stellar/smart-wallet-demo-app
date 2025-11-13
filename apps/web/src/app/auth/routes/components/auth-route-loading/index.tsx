import { OnboardingBackgroundImage } from 'src/app/core/components'
import { Loading } from 'src/components/atoms'
import { useTheme } from 'src/config/theme/provider'

export const AuthRouteLoading = () => {
  const { onboardingStyleVariant } = useTheme()

  return (
    <div>
      <OnboardingBackgroundImage
        isAnimated={onboardingStyleVariant === 'meridian-2025'}
        backgroundPosition={onboardingStyleVariant === 'stellar-house' ? 'center' : undefined}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Loading size="sm" />
      </div>
    </div>
  )
}
