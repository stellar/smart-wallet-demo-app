import clsx from 'clsx'

import { a } from 'src/interfaces/cms/useAssets'

type Props = {
  gradientTopPercentage?: number
  gradientBottomPercentage?: number
  isAnimated?: boolean
  className?: string
}

export const OnboardingBackgroundImage = ({
  className,
  isAnimated = false,
  gradientTopPercentage = 0,
  gradientBottomPercentage = 100,
}: Props) => {
  return (
    <div
      className={clsx('fixed', 'inset-0', 'bg-cover', 'z-[-1]', isAnimated && 'animate-background-move', className)}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${gradientTopPercentage}%, rgba(10, 10, 10, 0.8) ${gradientBottomPercentage}%), url(${a('onboardingBackground')}`,
      }}
    />
  )
}
