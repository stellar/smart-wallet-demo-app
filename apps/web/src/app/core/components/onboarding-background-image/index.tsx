import { a } from 'src/interfaces/cms/useAssets'

type Props = {
  gradientTopPercentage?: number
  gradientBottomPercentage?: number
  className?: string
}

export const OnboardingBackgroundImage = ({
  className,
  gradientTopPercentage = 0,
  gradientBottomPercentage = 100,
}: Props) => {
  return (
    <div
      className={`fixed inset-0 bg-cover z-[-1] ${className}`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${gradientTopPercentage}%, rgba(10, 10, 10, 0.8) ${gradientBottomPercentage}%), url(${a('onboardingBackground')}`,
      }}
    />
  )
}
